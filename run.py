from app import app as application
from app import socketio as socketio

if __name__ == "__main__":
    application.jinja_env.cache = {}
    socketio.run(application,log_output=True)
