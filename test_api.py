#!/usr/bin/env python3
"""
Flask API Test Script
Demonstrates how to interact with the Flask backend API endpoints
"""

import requests
import json

# Base URL for the Flask application
BASE_URL = "http://127.0.0.1:5000"

def test_api_endpoints():
    """Test various API endpoints"""
    
    print("🚀 Testing Flask Backend API Endpoints\n")
    print("=" * 50)
    
    # Test 1: Get all categories
    print("\n📂 Testing Categories API:")
    try:
        response = requests.get(f"{BASE_URL}/api/categories")
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ Found {len(categories['categories'])} categories:")
            for cat in categories['categories']:
                print(f"   - {cat['name']} ({cat['post_count']} posts)")
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 2: Get all posts
    print("\n📝 Testing Posts API:")
    try:
        response = requests.get(f"{BASE_URL}/api/posts")
        if response.status_code == 200:
            posts_data = response.json()
            print(f"✅ Found {posts_data['total']} total posts")
            print(f"   📄 Showing {len(posts_data['posts'])} posts on this page")
            for post in posts_data['posts'][:3]:  # Show first 3
                print(f"   - {post['title']} by {post['author']['display_name']}")
        else:
            print(f"❌ Error: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection error: {e}")
    
    # Test 3: Search functionality
    print("\n🔍 Testing Search API:")
    search_terms = ["technology", "python", "web"]
    for term in search_terms:
        try:
            response = requests.get(f"{BASE_URL}/api/search", params={"q": term})
            if response.status_code == 200:
                results = response.json()
                print(f"✅ Search for '{term}': {len(results['posts'])} results")
            else:
                print(f"❌ Search error: {response.status_code}")
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    # Test 4: Username validation
    print("\n👤 Testing Username Validation:")
    test_usernames = ["admin", "newuser123", "test"]
    for username in test_usernames:
        try:
            response = requests.get(f"{BASE_URL}/api/validate_username", params={"username": username})
            if response.status_code == 200:
                result = response.json()
                status = "✅ Available" if result['available'] else "❌ Taken"
                print(f"   {username}: {status} - {result['message']}")
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    # Test 5: Email validation
    print("\n📧 Testing Email Validation:")
    test_emails = ["admin@example.com", "newuser@test.com", "available@email.com"]
    for email in test_emails:
        try:
            response = requests.get(f"{BASE_URL}/api/validate_email", params={"email": email})
            if response.status_code == 200:
                result = response.json()
                status = "✅ Available" if result['available'] else "❌ Taken"
                print(f"   {email}: {status} - {result['message']}")
        except Exception as e:
            print(f"❌ Connection error: {e}")

def test_with_authentication():
    """Demonstrate authenticated API calls"""
    
    print("\n🔐 Testing Authenticated Endpoints:")
    print("=" * 50)
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    # Login to get session
    login_data = {
        'username': 'admin',
        'password': 'admin123',
        'csrf_token': 'dummy'  # In real scenario, you'd get this from the form
    }
    
    print("\n🔑 Attempting admin login...")
    try:
        # Get the login page first to get CSRF token
        login_page = session.get(f"{BASE_URL}/auth/login")
        if login_page.status_code == 200:
            print("✅ Login page accessible")
            
            # In a real scenario, you'd parse the CSRF token from the HTML
            # For now, we'll test the user stats endpoint which might work
            
            # Test user stats endpoint (requires authentication)
            stats_response = session.get(f"{BASE_URL}/api/user_stats")
            if stats_response.status_code == 200:
                stats = stats_response.json()
                print("✅ User stats retrieved:")
                print(f"   - Total posts: {stats['total_posts']}")
                print(f"   - Published: {stats['published_posts']}")
                print(f"   - Drafts: {stats['draft_posts']}")
            else:
                print(f"❌ Authentication required (Status: {stats_response.status_code})")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main function to run all tests"""
    
    print("🧪 Flask Backend API Testing Tool")
    print("Make sure your Flask app is running on http://127.0.0.1:5000")
    print("\nStarting tests...\n")
    
    # Test public endpoints
    test_api_endpoints()
    
    # Test authenticated endpoints
    test_with_authentication()
    
    print("\n" + "=" * 50)
    print("✨ API Testing Complete!")
    print("\n💡 Next Steps:")
    print("   1. Visit http://127.0.0.1:5000 in your browser")
    print("   2. Register a new account or login as admin")
    print("   3. Create some posts and test the features")
    print("   4. Try the search functionality")
    print("   5. Explore the admin panel")

if __name__ == "__main__":
    # Check if requests library is available
    try:
        import requests
        main()
    except ImportError:
        print("❌ Error: 'requests' library not found")
        print("Install it with: pip install requests")
        
        print("\nAlternative: Test with curl commands:")
        print("curl http://127.0.0.1:5000/api/categories")
        print("curl http://127.0.0.1:5000/api/posts")
        print("curl \"http://127.0.0.1:5000/api/search?q=test\"") 