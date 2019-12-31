class Connection {

    /**
     * @constructor
     */
    constructor(port) {
        this.port = port || 8081;
    }


    createRequest(command, args, onSuccess, onError) {
        let request = {
            command: command,
            args: args,
            onSuccess: onSuccess,
            onError: onError
        };
        return request;
    }



    prologRequest(request) {
        // Get Parameter Values
        let requestString = request.command.toString();
        if (request.args != null)
            requestString += '(' + request.args.toString().replace(/"/g, '') + ')';
        console.log(requestString);
        // Make Request
        return this.getPrologRequest(requestString, request.onSuccess, request.onError);
    }


    getPrologRequest(requestString, onSuccess, onError) {
        var request = new XMLHttpRequest();

        request.open('GET', 'http://localhost:' + this.port + '/' + requestString, true);

        request.onload = function(data) {
            let reply;
            
            try {
                reply = JSON.parse(data.target.response);
            } catch (e) {
                console.log("JSON Parse ERROR");
                console.log(data.target.response);
                onError(data.target.response);
                return 400;
            }

            if (onSuccess && data.target.status == 200)
                onSuccess(reply);
            else
                console.log("Reply Message: ", reply.msg, "; Return Value: ", reply.return);
        };
        request.onerror = onError || function() {
            console.log("Error waiting for response");
            return 400;
        };
    
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        try {
            request.send();
        } catch(e) {
            console.log(e);
            return 400;
        }
    }


    // let requestString = 'playFieldsOfAction('+list+')’;
    // let request = new MyXMLHttpRequest(this);
    // request.addEventListener("load", this.parseStartPrologReply);
    // request.addEventListener("error",this.startPrologGameError);
    // request.open('GET', 'http://localhost:'+PORT+'/'+requestString, true);
    // request.setRequestHeader("Content-type", "application/x-www-formurlencoded; charset=UTF-8");
    // request.send();

    // parseStartPrologReply() {
    //     if (this.status === 400) {
    //     console.log("ERROR");
    //     return;
    //     }
    //     // the answer here is: [Board,CurrentPlayer,WhiteScore,BlackScore]
    //     let responseArray = textStringToArray(this.responseText,true);
    //     // do something with responseArray[0];
    //     // do something with responseArray[1];
    //     // do something with responseArray[2];
    //     // do something with responseArray[3];
    // }

}
