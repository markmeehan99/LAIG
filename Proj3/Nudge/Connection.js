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
        // Make Request
        console.log('Request: ' + requestString);
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

}
