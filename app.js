import React from 'react';
import ReactDOM from 'react-dom';
import request from 'superagent';
import MimeParser from 'emailjs-mime-parser';

function last(a){
    return a[a.length-1];
}

class MessageListItem extends React.Component {
    render(){
        let message = this.props.message;
        return (
            <li onClick={this.handleClick.bind(this)}>
                From: {message.from}
                To: {message.to}
             </li>
        )
    }
    
    handleClick(){
        console.log("onClick", this);
        this.props.onItemClicked(this.props.message);
    }
}

class MessageItem extends React.Component {
    switchActive(format){
        this.setState({
            activeFormat: format
        })
    }
    
    constructor(){
        super();
        this.state = {activeFormat:null};
    }
    
    componentDidMount(){
        this.setState({
            activeFormat: this.props.message.formats[0]
        });
    }
    
    render(){
        let message = this.props.message;
        let items = this.props.message.formats.map((format, i) => {
            let src = format.text;
            if(format.type == "text/plain"){
                src = `<pre>${src}</pre>`;
            }
            let cls = '';
            if(format == this.state.activeFormat){
                cls = 'active';
            }
            return (
                <iframe key={i} className={cls} srcDoc={src}></iframe>
            )
        });
        let tabs = this.props.message.formats.map((format, i) => {
            let cls = '';
            if(format == this.state.activeFormat){
                cls = 'active';
            }
            return (
                <li key={i} className={cls} onClick={this.switchActive.bind(this, format)}>{format.type}</li>
            )
        });
        return (
            <div className="activeEmail">
                <table className="details"><tbody>
                    <tr><th>From</th><td>{message.from}</td></tr>
                    <tr><th>To</th><td>{message.to}</td></tr>
                </tbody></table>
                <ul className="tabs">
                    {tabs}
                </ul>
                {items}
            </div>
        )
    }
}

class MessageList extends React.Component {
    constructor(){
        super();
        this.state = { emails: [], activeEmail: null };
    }

    handleChangeActiveEmail(message){
        console.log("state", this);
        this.setState({
            activeEmail: message
        });
    }

    render(){
        let list = this.state.emails.map((message) => {
           return (
                <MessageListItem key={message.id} message={message} onItemClicked={this.handleChangeActiveEmail.bind(this)} />
           );
        });
        let active = null;
        if(this.state.activeEmail != null){
            active = <MessageItem message={this.state.activeEmail} />;
        }
        
        return (
            <div>
                <div className="emails">
                    <ul>{list}</ul>
                </div>
                {active}
            </div>
        );
    }

    componentDidMount(){
        request.get("/emails", (error, res) => {
            let emails = [];
            res.body.emails.forEach((email,i) => {
                let parser = new MimeParser();
                let box = {
                    'formats': [],
                    'id': i
                };

                parser.onheader = function(node){
                    if(node.headers['from']){
                        box['from'] = last(node.headers['from']).initial;
                        box['to'] = last(node.headers['to']).initial;
                    }
                };
                parser.onbody = function(node, chunk){
                    console.log('Received %s bytes for %s', chunk.byteLength, node.path.join("."));
                    console.log(node);
                    box['formats'].push({
                        "type": node.headers['content-type'][0].value,
                        "text": new TextDecoder(node.charset).decode(node.content)
                    });
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

class AppChrome extends React.Component {
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
