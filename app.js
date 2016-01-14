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
        let cls = "";
        if(this.props.active){
            cls = "active";
        }
        
        return (
            <li onClick={this.handleClick.bind(this)} className={cls}>
                {message.subject}
                <small style={{display:"block"}}>
                    From: {message.from}&nbsp;
                    To: {message.to}
                </small>
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
        this.props = {
            message:{
                id: null
            }
        }
    }
    
    componentWillReceiveProps(nextProps){
        if(nextProps.message.id == this.props.message.id) return;
        this.setState({
            activeFormat: nextProps.message.formats[0]
        });
    }
    
    render(){
        let message = this.props.message;
        let items = this.props.message.formats.map((format, i) => {
            let src = format.text;
            if(format.type == "text/plain" || format.type == "raw"){
                src = `<pre>${escapeHtml(src)}</pre>`;
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
                    <tr><th>Subject</th><td>{message.subject}</td></tr>
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
        this.state = { emails: [], activeEmail: {id:null} };
    }

    handleChangeActiveEmail(message){
        this.setState({
            activeEmail: message
        });
    }

    render(){
        let list = this.state.emails.map((message) => {
           let active = this.state.activeEmail.id == message.id;
           return (
                <MessageListItem key={message.id} active={active}
                    message={message} onItemClicked={this.handleChangeActiveEmail.bind(this)} />
           );
        });
        let active = null;
        if(this.state.activeEmail.id != null){
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
        setInterval(() => {
            this.refresh();
        }, 5000);
        this.refresh();
    }
    
    refresh(){
        request.get("/emails", (error, res) => {
            let emails = [];
            res.body.emails.forEach((email,i) => {
                let parser = new MimeParser();
                let box = {
                    'formats': [],
                    'id': i,
                };

                parser.onheader = function(node){
                    if(node.headers['from']){
                        box['subject'] = last(node.headers['subject']).initial;
                        box['from'] = last(node.headers['from']).initial;
                        box['to'] = last(node.headers['to']).initial;
                    }
                };
                parser.onbody = function(node, chunk){
                    console.log('Received %s bytes for %s', chunk.byteLength, node.path.join("."));
                    console.log(node);
                    box['formats'].push({
                        "type": node.headers['content-type'][0].value,
                        // todo: check node.charset
                        "text": new TextDecoder("ascii").decode(chunk)
                    });
                };
                parser.onend = (email_obj) => {
                    console.log('---');
                };

                parser.write(email);
                parser.end();
                box.formats.push({
                    "type": "raw",
                    "text": email
                })
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

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
