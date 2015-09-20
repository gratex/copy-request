(function() {
	var showListBtn = document.getElementById("showRequestsBtn");
	var requestListBody = document.getElementById("requestListBody");

	var listeners = [];

	showListBtn.addEventListener("click", function() {
		chrome.devtools.network.getHAR(displayRequests);
	});
	chrome.devtools.network.getHAR(displayRequests);

	function displayRequests(har) {
		// console.log(har);
		var requests = har.entries;
		clearTable();
		requests.forEach(drawRow);
	}

	function clearTable() {
		requestListBody.innerHTML = "";
		listeners.forEach(function(item) {
			item.button.removeEventListener("click", item.listener);
		});
		listeners.splice(0);
	}

	function drawRow(request) {
		var row = document.createElement("tr");
		var copyNode = document.createElement("td");
		var copyBtn = document.createElement("button");
		copyBtn.title = "Copy";
		copyBtn.className = "copyBtn";
		var listener = copyRequest.bind(null, request);
		copyBtn.addEventListener("click", listener);
		listeners.push({
			button: copyBtn,
			listener: listener
		});
		copyNode.appendChild(copyBtn);
		var statusNode = document.createElement("td");
		statusNode.innerHTML = request.response.status;
		var urlNode = document.createElement("td");
		urlNode.innerHTML = request.request.url;
		requestListBody.appendChild(row);

		row.appendChild(copyNode);
		row.appendChild(statusNode);
		row.appendChild(urlNode);
	}

	function copyRequest(request) {
		formatRequest(request, function(stringToCopy) {
			copyToClipboard(stringToCopy);
		});
	}

	function formatRequest(entry, callback) {
		var requestHeaders = formatRequestHeaders(entry.request);
		var requestBody = formatRequestBody(entry.request);
		var responseHeaders = formatResponseHeaders(entry.response);
		formatResponseBody(entry, function(responseBody) {
			callback([
				requestHeaders,
				requestBody,
				responseHeaders,
				responseBody
			].join("\n\n"));
		});
	}

	function formatRequestHeaders(request) {
		return [
			request.method + " " + request.url
		].concat(formatHeaders(request.headers)).join("\n");
	}

	function formatRequestBody(request) {
		if (!request.postData) {
			return "";
		}
		if (request.postData.mimeType === "application/json") {
			try {
				return JSON.stringify(JSON.parse(request.postData.text), null, "\t");
			} catch (e) {
				return request.postData.text;
			}
		}
		return request.postData.text;
	}

	function formatResponseHeaders(response) {
		return [
			response.status + " " + response.statusText
		].concat(formatHeaders(response.headers)).join("\n");
	}

	function formatResponseBody(request, callback) {
		request.getContent(function(content) {
			callback(content);
		});
	}

	function formatHeaders(headers) {
		return headers.map(function(header) {
			return header.name + ": " + header.value;
		});
	}

	function copyToClipboard(text) {
		var textarea = document.createElement("textarea");

		//copy doesn't work when not placed in dom or hidden with display none, so hide it off screen
		textarea.style.width = 0;
		textarea.style.height = 0;
		textarea.style.position = "absolute";
		textarea.style.top = "-50px";
		document.body.appendChild(textarea);

		textarea.value = text;
		textarea.select();
		document.execCommand("copy");

		document.body.removeChild(textarea);
	}
})();