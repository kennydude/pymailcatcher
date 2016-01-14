# pymailcatcher

[Mailcatcher](mailcatcher.me) broke recently for me. I don't know Ruby at all, so I
rewrote my own in Python. Probably should use a different name.

Install:

1. `pip install flask`
2. `npm install`
3. `npm run-script build`
4. `mkdir tmp`

Now to run:

    node boot.js

(Yes I'm using Node to start Python processes, because threading + python = pain)

Now you should have an SMTP on 1025 and HTTP on 5000.

To clear emails, clear the tmp folder. This may be added to the UI at some point.
