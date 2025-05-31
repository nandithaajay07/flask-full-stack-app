import os
import socket
from app import create_app

def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote address to determine local IP
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"

app = create_app()

if __name__ == '__main__':
    # Development server configuration
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')  # Listen on all network interfaces
    
    # Get actual IP address
    local_ip = get_local_ip()
    
    print("🚀 Flask Application Starting...")
    print(f"🌐 Server will be accessible at:")
    print(f"   - Local: http://127.0.0.1:{port}")
    print(f"   - Network: http://{local_ip}:{port}")
    print(f"   - Admin Login: admin / admin123")
    print("📱 Share the Network URL with others to let them access your app!")
    print(f"\n⚠️  If network access doesn't work:")
    print("   1. Check Windows Firewall settings")
    print("   2. Make sure you're on the same WiFi network")
    print("   3. Try running as administrator")
    
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        threaded=True  # Handle multiple requests simultaneously
    ) 