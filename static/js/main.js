$(document).ready(function() {
    // CSRF Token setup for AJAX requests
    const csrfToken = $('meta[name=csrf-token]').attr('content');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrfToken);
            }
        }
    });

    // Global variables
    let searchTimeout;
    
    // ===== SEARCH FUNCTIONALITY =====
    $('#searchInput').on('input', function() {
        const query = $(this).val().trim();
        const $results = $('#searchResults');
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        if (query.length < 2) {
            $results.addClass('d-none').empty();
            return;
        }
        
        // Debounce search to avoid too many requests
        searchTimeout = setTimeout(function() {
            performSearch(query);
        }, 300);
    });
    
    function performSearch(query) {
        const $results = $('#searchResults');
        const $input = $('#searchInput');
        
        // Show loading state
        $results.removeClass('d-none').html('<div class="text-center p-3"><div class="spinner"></div> Searching...</div>');
        
        $.ajax({
            url: '/api/search',
            method: 'GET',
            data: { q: query },
            success: function(data) {
                displaySearchResults(data.posts);
            },
            error: function() {
                $results.html('<div class="text-center p-3 text-danger">Error occurred while searching</div>');
            }
        });
    }
    
    function displaySearchResults(posts) {
        const $results = $('#searchResults');
        
        if (posts.length === 0) {
            $results.html('<div class="text-center p-3 text-muted">No posts found</div>');
            return;
        }
        
        let html = '';
        posts.forEach(function(post) {
            const excerpt = post.content.length > 100 ? 
                post.content.substring(0, 100) + '...' : post.content;
            
            html += `
                <div class="search-result-item" data-post-id="${post.id}">
                    <div class="search-result-title">${post.title}</div>
                    <div class="search-result-content">${excerpt}</div>
                    <div class="search-result-meta">
                        By ${post.author.full_name} • ${formatDate(post.created_at)}
                    </div>
                </div>
            `;
        });
        
        $results.html(html);
    }
    
    // Handle search result clicks
    $(document).on('click', '.search-result-item', function() {
        const postId = $(this).data('post-id');
        window.location.href = `/post/${postId}`;
    });
    
    // Hide search results when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#searchForm').length) {
            $('#searchResults').addClass('d-none');
        }
    });
    
    // ===== FORM VALIDATION =====
    
    // Real-time username validation
    $('#username').on('blur', function() {
        const username = $(this).val().trim();
        const $field = $(this);
        const $feedback = $field.siblings('.field-validation');
        
        if (username.length >= 3) {
            validateField('/api/validate_username', { username: username }, $field, $feedback);
        }
    });
    
    // Real-time email validation
    $('#email').on('blur', function() {
        const email = $(this).val().trim();
        const $field = $(this);
        const $feedback = $field.siblings('.field-validation');
        
        if (email.length > 0 && isValidEmail(email)) {
            validateField('/api/validate_email', { email: email }, $field, $feedback);
        }
    });
    
    function validateField(url, data, $field, $feedback) {
        $.ajax({
            url: url,
            method: 'GET',
            data: data,
            success: function(response) {
                if (response.available) {
                    $field.removeClass('is-invalid').addClass('is-valid');
                    $feedback.removeClass('invalid').addClass('valid').text(response.message);
                } else {
                    $field.removeClass('is-valid').addClass('is-invalid');
                    $feedback.removeClass('valid').addClass('invalid').text(response.message);
                }
            },
            error: function() {
                $field.removeClass('is-valid is-invalid');
                $feedback.removeClass('valid invalid').text('');
            }
        });
    }
    
    // Password confirmation validation
    $('#password2').on('input', function() {
        const password = $('#password').val();
        const confirmPassword = $(this).val();
        const $field = $(this);
        const $feedback = $field.siblings('.field-validation');
        
        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                $field.removeClass('is-invalid').addClass('is-valid');
                $feedback.removeClass('invalid').addClass('valid').text('Passwords match');
            } else {
                $field.removeClass('is-valid').addClass('is-invalid');
                $feedback.removeClass('valid').addClass('invalid').text('Passwords do not match');
            }
        } else {
            $field.removeClass('is-valid is-invalid');
            $feedback.removeClass('valid invalid').text('');
        }
    });
    
    // ===== AJAX FORM SUBMISSIONS =====
    
    // Handle login form with AJAX
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        const $form = $(this);
        const $button = $form.find('button[type="submit"]');
        const originalText = $button.text();
        
        // Show loading state
        $button.prop('disabled', true).html('<span class="spinner"></span> Signing in...');
        
        $.ajax({
            url: $form.attr('action'),
            method: 'POST',
            data: $form.serialize(),
            success: function(response) {
                if (response.success) {
                    showAlert('success', response.message);
                    setTimeout(function() {
                        window.location.href = response.redirect || '/dashboard';
                    }, 1000);
                } else {
                    showAlert('danger', response.message || 'Login failed');
                    $button.prop('disabled', false).text(originalText);
                }
            },
            error: function() {
                showAlert('danger', 'An error occurred. Please try again.');
                $button.prop('disabled', false).text(originalText);
            }
        });
    });
    
    // ===== POST MANAGEMENT =====
    
    // Delete post confirmation
    $('.delete-post-btn').on('click', function(e) {
        e.preventDefault();
        const $button = $(this);
        const postTitle = $button.data('post-title');
        
        if (confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
            const $form = $('<form>', {
                method: 'POST',
                action: $button.attr('href')
            });
            
            // Add CSRF token
            const csrfToken = $('meta[name="csrf-token"]').attr('content');
            if (csrfToken) {
                $form.append($('<input>', {
                    type: 'hidden',
                    name: 'csrf_token',
                    value: csrfToken
                }));
            }
            
            $('body').append($form);
            $form.submit();
        }
    });
    
    // Auto-save draft functionality
    let autoSaveTimeout;
    $('#postForm textarea, #postForm input[type="text"]').on('input', function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(autoSaveDraft, 5000); // Auto-save after 5 seconds of inactivity
    });
    
    function autoSaveDraft() {
        const title = $('#title').val();
        const content = $('#content').val();
        
        if (title.trim() || content.trim()) {
            localStorage.setItem('draft_title', title);
            localStorage.setItem('draft_content', content);
            showToast('Draft saved automatically', 'info');
        }
    }
    
    // Load draft on page load
    if ($('#postForm').length && !$('#title').val() && !$('#content').val()) {
        const draftTitle = localStorage.getItem('draft_title');
        const draftContent = localStorage.getItem('draft_content');
        
        if (draftTitle || draftContent) {
            if (confirm('A draft was found. Would you like to load it?')) {
                $('#title').val(draftTitle || '');
                $('#content').val(draftContent || '');
            } else {
                localStorage.removeItem('draft_title');
                localStorage.removeItem('draft_content');
            }
        }
    }
    
    // Clear draft when form is submitted
    $('#postForm').on('submit', function() {
        localStorage.removeItem('draft_title');
        localStorage.removeItem('draft_content');
    });
    
    // ===== UTILITY FUNCTIONS =====
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    function showAlert(type, message) {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        $('.container').first().prepend(alertHtml);
        
        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            $('.alert').first().alert('close');
        }, 5000);
    }
    
    function showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        if (!$('#toastContainer').length) {
            $('body').append('<div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3"></div>');
        }
        
        const toastId = 'toast_' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast" role="alert">
                <div class="toast-header">
                    <i class="bi bi-info-circle text-${type} me-2"></i>
                    <strong class="me-auto">Notification</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">${message}</div>
            </div>
        `;
        
        $('#toastContainer').append(toastHtml);
        const toast = new bootstrap.Toast(document.getElementById(toastId));
        toast.show();
        
        // Remove toast element after it's hidden
        $(`#${toastId}`).on('hidden.bs.toast', function() {
            $(this).remove();
        });
    }
    
    // ===== DASHBOARD FUNCTIONALITY =====
    
    // Load user stats for dashboard
    if ($('#userStats').length) {
        loadUserStats();
    }
    
    function loadUserStats() {
        $.ajax({
            url: '/api/user_stats',
            method: 'GET',
            success: function(data) {
                $('#totalPosts').text(data.total_posts);
                $('#publishedPosts').text(data.published_posts);
                $('#draftPosts').text(data.draft_posts);
            },
            error: function() {
                console.log('Failed to load user statistics');
            }
        });
    }
    
    // ===== ENHANCED FORM INTERACTIONS =====
    
    // Character counter for text areas
    $('textarea[maxlength]').each(function() {
        const $textarea = $(this);
        const maxLength = $textarea.attr('maxlength');
        const $counter = $('<div class="text-muted small text-end mt-1"></div>');
        $textarea.after($counter);
        
        function updateCounter() {
            const remaining = maxLength - $textarea.val().length;
            $counter.text(`${remaining} characters remaining`);
            
            if (remaining < 50) {
                $counter.addClass('text-warning').removeClass('text-muted');
            } else {
                $counter.addClass('text-muted').removeClass('text-warning');
            }
        }
        
        updateCounter();
        $textarea.on('input', updateCounter);
    });
    
    // Form field animations
    $('.form-floating .form-control').on('focus blur', function() {
        $(this).parent().toggleClass('focused');
    });
    
    // ===== ACCESSIBILITY ENHANCEMENTS =====
    
    // Keyboard navigation for search results
    $('#searchInput').on('keydown', function(e) {
        const $results = $('#searchResults');
        const $items = $results.find('.search-result-item');
        const $current = $items.filter('.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if ($current.length === 0) {
                $items.first().addClass('active');
            } else {
                $current.removeClass('active').next().addClass('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if ($current.length > 0) {
                $current.removeClass('active').prev().addClass('active');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if ($current.length > 0) {
                $current.click();
            }
        } else if (e.key === 'Escape') {
            $results.addClass('d-none');
            $(this).blur();
        }
    });
    
    // Focus management for modals
    $('.modal').on('shown.bs.modal', function() {
        $(this).find('input, textarea, select').first().focus();
    });
    
    console.log('Flask App JavaScript initialized successfully');
}); 