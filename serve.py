from os import listdir
from os.path import isfile, join
from flask import Flask, redirect, jsonify
app = Flask(__name__)

@app.route('/')
def home_page():
    return redirect('/static/index.html')

@app.route('/emails')
def get_emails():
    emails = [f for f in listdir('tmp') if isfile(join('tmp', f))]
    emails.sort(key=lambda x: os.path.getmtime(x))
    ret = []
    for email in emails:
        ret.append(open('tmp/{}'.format(email), 'r').read())
    return jsonify({'emails':ret})

if __name__ == '__main__':
    app.run(host='0.0.0.0')
