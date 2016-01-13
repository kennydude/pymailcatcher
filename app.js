import React from 'react';
import ReactDOM from 'react-dom';
import request from 'superagent';
import MimeParser from 'emailjs-mime-parser';

class MessageList extends React.Component{
    constructor(){
        super();
        this.state = { emails: [] };
    }
    
    render(){
        let list = this.state.emails.map((message) => {
           console.log(message);
           return (
             <li key={message.id}>
                node
             </li>
           );
        });
        return (
            <ul>{list}</ul>
        );
    }
    
    componentDidMount(){
        request.get("/emails", (error, res) => {
            let emails = [];
            res.body.emails.forEach((email,i) => {
                let parser = new MimeParser();
                let box = {
                    'formats': {},
                    'id': i
                };

                parser.onheader = function(node){
                    console.log("HEADERS", node.header.join('\n')); // List all headers
                    console.log(node.headers); // List value for Content-Type
                    if(node.headers['from']){
                        box['from'] = node.headers['from'];
                        box['to'] = node.headers['to'];
                    }
                };
                parser.onbody = function(node, chunk){
                    console.log('Received %s bytes for %s', chunk.byteLength, node.path.join("."));
                    box['formats'][node.headers['content-type'][0].value] = new TextDecoder('utf-8').decode(chunk);
                };
                parser.onend = (email_obj) => {
                    console.log('---');
                };

                parser.write(email);
                parser.end();
                emails.push(box);
            });
            this.setState({
                emails: emails
            });
        });
    }
}

class AppChrome extends React.Component{
    render(){
        return (<div>
            <h1>mailcatcher</h1>
            <MessageList/>
        </div>);
    }
}


ReactDOM.render(
    <AppChrome/>,
    document.getElementById("container")
)
