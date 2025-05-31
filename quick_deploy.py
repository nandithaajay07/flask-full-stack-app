#!/usr/bin/env python3
"""
Quick Deploy Script - Get Public URL for Flask App
Makes your local Flask app accessible to anyone on the internet
"""

import subprocess
import sys
import time
import threading
import requests
from urllib.parse import urljoin

def check_ngrok_installed():
    """Check if ngrok is installed"""
    try:
        subprocess.run(['ngrok', 'version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def install_ngrok():
    """Provide instructions to install ngrok"""
    print("🔧 ngrok not found. To get a public URL:")
    print("\n📥 Install ngrok:")
    print("   1. Go to: https://ngrok.com/download")
    print("   2. Download for Windows")
    print("   3. Extract and add to PATH")
    print("   4. Run: ngrok authtoken YOUR_TOKEN")
    print("\n💡 Alternative: Use a cloud deployment platform")
    return False

def get_public_url_with_ngrok():
    """Start ngrok tunnel and get public URL"""
    print("🚀 Starting ngrok tunnel...")
    
    try:
        # Start ngrok in background
        process = subprocess.Popen(
            ['ngrok', 'http', '5000', '--log=stdout'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for ngrok to start
        time.sleep(3)
        
        # Get the public URL from ngrok API
        try:
            response = requests.get('http://127.0.0.1:4040/api/tunnels')
            data = response.json()
            
            if 'tunnels' in data and len(data['tunnels']) > 0:
                public_url = data['tunnels'][0]['public_url']
                print(f"\n🌍 YOUR APP IS NOW PUBLIC!")
                print(f"🔗 Public URL: {public_url}")
                print(f"📱 Share this URL with anyone!")
                print(f"👤 Admin Login: admin / admin123")
                print(f"\n⚠️  This tunnel will stay active while this script runs")
                print("   Press Ctrl+C to stop the tunnel")
                
                return process, public_url
            else:
                print("❌ Could not get public URL from ngrok")
                return None, None
                
        except requests.RequestException:
            print("❌ Could not connect to ngrok API")
            return None, None
            
    except FileNotFoundError:
        print("❌ ngrok not found in PATH")
        return None, None

def check_flask_running():
    """Check if Flask app is running"""
    try:
        response = requests.get('http://127.0.0.1:5000', timeout=2)
        return response.status_code == 200
    except requests.RequestException:
        return False

def main():
    """Main deployment function"""
    print("🚀 Quick Deploy - Make Your Flask App Public")
    print("=" * 50)
    
    # Check if Flask app is running
    print("🔍 Checking if Flask app is running...")
    if not check_flask_running():
        print("❌ Flask app is not running on http://127.0.0.1:5000")
        print("💡 Start your Flask app first: python run.py")
        return
    
    print("✅ Flask app is running!")
    
    # Check for ngrok
    if not check_ngrok_installed():
        install_ngrok()
        print("\n🌐 Current Access Methods:")
        print(f"   - Local: http://127.0.0.1:5000")
        print(f"   - Network: http://192.168.1.2:5000")
        print("\n📋 Cloud Deployment Options:")
        print("   - Railway: https://railway.app (Recommended)")
        print("   - Render: https://render.com")
        print("   - Heroku: https://heroku.com")
        return
    
    # Start ngrok tunnel
    process, public_url = get_public_url_with_ngrok()
    
    if process and public_url:
        try:
            # Keep the tunnel running
            print(f"\n🔄 Tunnel Status: ACTIVE")
            print(f"🌍 Your app is live at: {public_url}")
            
            # Wait for user to stop
            process.wait()
            
        except KeyboardInterrupt:
            print(f"\n\n🛑 Stopping ngrok tunnel...")
            process.terminate()
            print("✅ Tunnel stopped.")
    
    print("\n💡 For permanent deployment, see DEPLOYMENT.md")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Try cloud deployment instead - see DEPLOYMENT.md") 