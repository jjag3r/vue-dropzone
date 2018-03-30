! function(e, o) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = o() : "function" == typeof define && define.amd ? define(o) : e.vue2Dropzone = o()
}(this, function() {
    "use strict";
    var e = {
        getSignedURL: function(e, o) {
            var n = {
                filePath: e.name,
                contentType: e.type
            };
            return new Promise(function(t, i) {
                var r = new FormData,
                    s = new XMLHttpRequest,
                    d = "function" == typeof o.signingURL ? o.signingURL(e) : o.signingURL;
                s.open("POST", d), s.onload = function() {
                    200 == s.status ? t(JSON.parse(s.response)) : i(s.statusText)
                }, s.onerror = function(e) {
                    console.error("Network Error : Could not send request to AWS (Maybe CORS errors)"), i(e)
                }, Object.entries(o.headers || {}).forEach(function(e) {
                    var o = e[0],
                        n = e[1];
                    s.setRequestHeader(o, n)
                }), n = Object.assign(n, o.params || {}), Object.entries(n).forEach(function(e) {
                    var o = e[0],
                        n = e[1];
                    r.append(o, n)
                }), s.send(r)
            })
        },
        sendFile: function(e, o, vue) {
            var n = new FormData;
            return this.getSignedURL(e, o).then(function(o) {
                var t = o.signature;
                return Object.keys(t).forEach(function(e) {
                    n.append(e, t[e])
                }), n.append("file", e), new Promise(function(e, t) {
                    var i = new XMLHttpRequest;
                    i.upload.onprogress = function(oEvent) {
                        if (oEvent.lengthComputable) {
                            var file = vue.dropzone.files.find(function (obj) {
                                return obj.name === n.get('file').name;
                            });
                            var percentComplete = oEvent.loaded / oEvent.total;
                            vue.dropzone.emit("uploadprogress", file, percentComplete * 100, oEvent.loaded);
                        }
                    };
                    i.open("POST", o.postEndpoint), i.onload = function() {
                        if (201 == i.status) {
                            var o = (new window.DOMParser).parseFromString(i.response, "text/xml").firstChild.children[0].innerHTML;
                            e({
                                success: !0,
                                message: o
                            })
                        } else {
                            var n = (new window.DOMParser).parseFromString(i.response, "text/xml").firstChild.children[0].innerHTML;
                            t({
                                success: !1,
                                message: n + ". Request is marked as resolved when returns as status 201"
                            })
                        }
                    }, i.onerror = function(e) {
                        var o = (new window.DOMParser).parseFromString(i.response, "text/xml").firstChild.children[1].innerHTML;
                        t({
                            success: !1,
                            message: o
                        })
                    }, i.send(n)
                })
            }).catch(function(e) {
                return e
            })
        }
    };
    return {
        render: function() {
            var e = this.$createElement;
            return (this._self._c || e)("div", {
                ref: "dropzoneElement",
                class: {
                    "vue-dropzone dropzone": this.includeStyling
                },
                attrs: {
                    id: this.id
                }
            })
        },
        staticRenderFns: [],
        props: {
            id: {
                type: String,
                required: !0
            },
            options: {
                type: Object,
                required: !0
            },
            includeStyling: {
                type: Boolean,
                default: !0,
                required: !1
            },
            awss3: {
                type: Object,
                required: !1,
                default: null
            },
            destroyDropzone: {
                type: Boolean,
                default: !0,
                required: !1
            }
        },
        data: function() {
            return {
                isS3: !1,
                wasQueueAutoProcess: !0
            }
        },
        computed: {
            dropzoneSettings: function() {
                var e = {
                    thumbnailWidth: 200,
                    thumbnailHeight: 200
                };
                return Object.keys(this.options).forEach(function(o) {
                    e[o] = this.options[o]
                }, this), null !== this.awss3 && (e.autoProcessQueue = !1, this.isS3 = !0, void 0 !== this.options.autoProcessQueue && (this.wasQueueAutoProcess = this.options.autoProcessQueue)), e
            }
        },
        methods: {
            manuallyAddFile: function(e, o) {
                e.manuallyAdded = !0, this.dropzone.emit("addedfile", e), o && this.dropzone.emit("thumbnail", e, o);
                for (var n = e.previewElement.querySelectorAll("[data-dz-thumbnail]"), t = 0; t < n.length; t++) n[t].style.width = this.dropzoneSettings.thumbnailWidth + "px", n[t].style.height = this.dropzoneSettings.thumbnailHeight + "px", n[t].style["object-fit"] = "contain";
                this.dropzone.emit("complete", e), this.dropzone.options.maxFiles && this.dropzone.options.maxFiles--, this.dropzone.files.push(e), this.$emit("vdropzone-file-added-manually", e)
            },
            setOption: function(e, o) {
                this.dropzone.options[e] = o
            },
            removeAllFiles: function(e) {
                this.dropzone.removeAllFiles(e)
            },
            processQueue: function() {
                var e = this,
                    o = this.dropzone;
                this.isS3 && !this.wasQueueAutoProcess ? this.getQueuedFiles().forEach(function(o) {
                    e.getSignedAndUploadToS3(o)
                }) : this.dropzone.processQueue(), this.dropzone.on("success", function() {
                    o.options.autoProcessQueue = !0
                }), this.dropzone.on("queuecomplete", function() {
                    o.options.autoProcessQueue = !1
                })
            },
            init: function() {
                return this.dropzone.init()
            },
            destroy: function() {
                return this.dropzone.destroy()
            },
            updateTotalUploadProgress: function() {
                return this.dropzone.updateTotalUploadProgress()
            },
            getFallbackForm: function() {
                return this.dropzone.getFallbackForm()
            },
            getExistingFallback: function() {
                return this.dropzone.getExistingFallback()
            },
            setupEventListeners: function() {
                return this.dropzone.setupEventListeners()
            },
            removeEventListeners: function() {
                return this.dropzone.removeEventListeners()
            },
            disable: function() {
                return this.dropzone.disable()
            },
            enable: function() {
                return this.dropzone.enable()
            },
            filesize: function(e) {
                return this.dropzone.filesize(e)
            },
            accept: function(e, o) {
                return this.dropzone.accept(e, o)
            },
            addFile: function(e) {
                return this.dropzone.addFile(e)
            },
            removeFile: function(e) {
                this.dropzone.removeFile(e)
            },
            getAcceptedFiles: function() {
                return this.dropzone.getAcceptedFiles()
            },
            getRejectedFiles: function() {
                return this.dropzone.getRejectedFiles()
            },
            getFilesWithStatus: function() {
                return this.dropzone.getFilesWithStatus()
            },
            getQueuedFiles: function() {
                return this.dropzone.getQueuedFiles()
            },
            getUploadingFiles: function() {
                return this.dropzone.getUploadingFiles()
            },
            getAddedFiles: function() {
                return this.dropzone.getAddedFiles()
            },
            getActiveFiles: function() {
                return this.dropzone.getActiveFiles()
            },
            getSignedAndUploadToS3: function(o) {
                var n = this;
                let neki = e.sendFile(o, this.awss3, n).then(function(e) {
                    e.success ? (o.s3ObjectLocation = e.message, setTimeout(function() {
                        n.dropzone.emit("success", o, 'responseText', e);
                        n.dropzone.emit("complete", o);
                    }), n.$emit("vdropzone-s3-upload-success", e.message, o)) : "undefined" != typeof message ? n.$emit("vdropzone-s3-upload-error", e.message) : n.$emit("vdropzone-s3-upload-error", "Network Error : Could not send request to AWS. (Maybe CORS error)")
                }).catch(function(e) {
                    alert(e)
                })
            },
            setAWSSigningURL: function(e) {
                this.isS3 && (this.awss3.signingURL = e)
            }
        },
        mounted: function() {
            if (!this.$isServer || !this.hasBeenMounted) {
                this.hasBeenMounted = !0;
                var e = require("dropzone");
                e.autoDiscover = !1, this.dropzone = new e(this.$refs.dropzoneElement, this.dropzoneSettings);
                var o = this;
                this.dropzone.on("thumbnail", function(e, n) {
                    o.$emit("vdropzone-thumbnail", e, n)
                }), this.dropzone.on("addedfile", function(e) {
                    o.duplicateCheck && this.files.length && this.files.forEach(function(n) {
                        n.name === e.name && (this.removeFile(e), o.$emit("duplicate-file", e))
                    }, this), o.$emit("vdropzone-file-added", e), o.isS3 && o.wasQueueAutoProcess && o.getSignedAndUploadToS3(e)
                }), this.dropzone.on("addedfiles", function(e) {
                    o.$emit("vdropzone-files-added", e)
                }), this.dropzone.on("removedfile", function(e) {
                    o.$emit("vdropzone-removed-file", e), e.manuallyAdded && o.dropzone.options.maxFiles++
                }), this.dropzone.on("success", function(e, n) {
                    o.$emit("vdropzone-success", e, n), o.isS3 && o.wasQueueAutoProcess && o.setOption("autoProcessQueue", !1)
                }), this.dropzone.on("successmultiple", function(e, n) {
                    o.$emit("vdropzone-success-multiple", e, n)
                }), this.dropzone.on("error", function(e, n, t) {
                    o.$emit("vdropzone-error", e, n, t)
                }), this.dropzone.on("errormultiple", function(e, n, t) {
                    o.$emit("vdropzone-error-multiple", e, n, t)
                }), this.dropzone.on("sending", function(e, n, t) {
                    o.isS3 && t.append("s3ObjectLocation", e.s3ObjectLocation), o.$emit("vdropzone-sending", e, n, t)
                }), this.dropzone.on("sendingmultiple", function(e, n, t) {
                    o.$emit("vdropzone-sending-multiple", e, n, t)
                }), this.dropzone.on("complete", function(e) {
                    o.$emit("vdropzone-complete", e)
                }), this.dropzone.on("completemultiple", function(e) {
                    o.$emit("vdropzone-complete-multiple", e)
                }), this.dropzone.on("canceled", function(e) {
                    o.$emit("vdropzone-canceled", e)
                }), this.dropzone.on("canceledmultiple", function(e) {
                    o.$emit("vdropzone-canceled-multiple", e)
                }), this.dropzone.on("maxfilesreached", function(e) {
                    o.$emit("vdropzone-max-files-reached", e)
                }), this.dropzone.on("maxfilesexceeded", function(e) {
                    o.$emit("vdropzone-max-files-exceeded", e)
                }), this.dropzone.on("processing", function(e) {
                    o.$emit("vdropzone-processing", e)
                }), this.dropzone.on("processing", function(e) {
                    o.$emit("vdropzone-processing", e)
                }), this.dropzone.on("processingmultiple", function(e) {
                    o.$emit("vdropzone-processing-multiple", e)
                }), this.dropzone.on("uploadprogress", function(e, n, t) {
                    o.$emit("vdropzone-upload-progress", e, n, t)
                }), this.dropzone.on("totaluploadprogress", function(e, n, t) {
                    o.$emit("vdropzone-total-upload-progress", e, n, t)
                }), this.dropzone.on("reset", function() {
                    o.$emit("vdropzone-reset")
                }), this.dropzone.on("queuecomplete", function() {
                    o.$emit("vdropzone-queue-complete")
                }), this.dropzone.on("drop", function(e) {
                    o.$emit("vdropzone-drop", e)
                }), this.dropzone.on("dragstart", function(e) {
                    o.$emit("vdropzone-drag-start", e)
                }), this.dropzone.on("dragend", function(e) {
                    o.$emit("vdropzone-drag-end", e)
                }), this.dropzone.on("dragenter", function(e) {
                    o.$emit("vdropzone-drag-enter", e)
                }), this.dropzone.on("dragover", function(e) {
                    o.$emit("vdropzone-drag-over", e)
                }), this.dropzone.on("dragleave", function(e) {
                    o.$emit("vdropzone-drag-leave", e)
                }), o.$emit("vdropzone-mounted")
            }
        },
        beforeDestroy: function() {
            this.destroyDropzone && this.dropzone.destroy()
        }
    }
});
//# sourceMappingURL=vue2Dropzone.js.map