#!/usr/bin/env python3
"""
Database Explorer Script
Direct interaction with the Flask SQLAlchemy models
"""

import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def explore_database():
    """Explore the database directly through SQLAlchemy models"""
    
    try:
        from app import create_app, db
        from app.models import User, Post, Category, Comment
        
        # Create app context
        app = create_app()
        
        with app.app_context():
            print("🗄️  Database Explorer - Direct Backend Interaction")
            print("=" * 50)
            
            # Explore Users
            print(f"\n👥 Users in Database:")
            users = User.query.all()
            for user in users:
                print(f"   - {user.username} ({user.get_display_name()}) - Admin: {user.is_admin}")
                print(f"     📧 {user.email} | Posts: {user.get_post_count()}")
            
            # Explore Categories
            print(f"\n📂 Categories in Database:")
            categories = Category.query.all()
            for cat in categories:
                print(f"   - {cat.name} ({cat.color}) - {cat.post_count} posts")
                print(f"     📝 {cat.description}")
            
            # Explore Posts
            print(f"\n📝 Posts in Database:")
            posts = Post.query.all()
            if posts:
                for post in posts:
                    print(f"   - {post.title} by {post.author.username}")
                    print(f"     👀 Views: {post.view_count} | Comments: {post.get_comment_count()}")
            else:
                print("   📭 No posts yet - Create some content!")
            
            # Explore Comments  
            print(f"\n💬 Comments in Database:")
            comments = Comment.query.all()
            if comments:
                for comment in comments:
                    print(f"   - {comment.author.username}: {comment.content[:50]}...")
            else:
                print("   💭 No comments yet")
            
            # Database Stats
            print(f"\n📊 Database Statistics:")
            print(f"   - Users: {User.query.count()}")
            print(f"   - Categories: {Category.query.count()}")
            print(f"   - Posts: {Post.query.count()}")
            print(f"   - Comments: {Comment.query.count()}")
            
            print(f"\n🔥 Quick Actions You Can Take:")
            print("   1. 📱 Open http://127.0.0.1:5000 in browser")
            print("   2. 🔑 Login as admin (admin/admin123)")
            print("   3. ✍️  Create your first post")
            print("   4. 🎨 Customize categories")
            print("   5. 👤 Register new users")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure Flask app is set up correctly!")

if __name__ == "__main__":
    explore_database() 