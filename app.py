from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('move_piece')
def handle_move(data):
    # Отправляем позицию другим клиентам
    emit('piece_moved', data, broadcast=True, include_self=False)

@socketio.on('chat_message')
def handle_chat_message(data):
    emit('chat_message', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)

