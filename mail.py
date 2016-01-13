import smtpd
import asyncore
import threading
import time
import sys
import random

class CustomSMTPServer(smtpd.SMTPServer):
    
    def process_message(self, peer, mailfrom, rcpttos, data):
        print 'Receiving message from:', peer
        print 'Message addressed from:', mailfrom
        print 'Message addressed to  :', rcpttos
        print 'Message length        :', len(data)
        with open('tmp/{}_{}.email'.format(time.time(), random.randint(0,100)), 'w') as d:
            d.write('From: {}\nTo: {}\n'.format(mailfrom, ', '.join(rcpttos)))
            d.write(data)
        print '----'
        return

server = CustomSMTPServer(('0.0.0.0', 1025), None)
print '> SMTP up; 0.0.0.0:1025'

asyncore.loop()
