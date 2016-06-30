Dropzone.options.uploadWidget = {
    paramName: 'file',
    maxFilesize: 2, // MB
    maxFiles: 1,
    dictDefaultMessage: 'Drag an image here to upload (or click to select one)',
    
    init: function () { this.on("complete", function (file) {
		if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
		    window.location.href = '/index.html?' + file.name;
		};
	    });
    }
};