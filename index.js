var main;
(() => {
    main = new class main {
        constructor() {
            this.seviceMulti = false;
            this.form = {};
            this.value = {
                offset: 0,
                dataB: null,
                dataA: null,
                data: null,
                url: null
            };
        };
        init() {
            this.form = document.querySelector('form[name=input]');
            if (this.seviceMulti) {
                this.form.querySelector('input[type=file]').multiple = true;
            }
            this.form.action = "javascript:main.submitHandler()";
            return new Promise((resolve, reject) => {
                resolve(this)
            })
        }
        bufferToHex(buffer) {
            var s = '', h = '0123456789ABCDEF';
            (new Uint8Array(buffer)).forEach((v) => { s += h[v >> 4] + h[v & 15]; });
            return s;
        }
        process() {

        }
        submitHandler() {
            // console.log(this.form)
            this.value.offset = Number(this.form.querySelector('input[type=number]').value);
            const curFiles = this.form.querySelector('input[type=file]').files;
            this.form.style.display = 'none';
            const consoleView = document.createElement('ul');
            document.body.appendChild(consoleView);
            const mylog = (str, delLast) => {
                if (!delLast) {
                    consoleView.appendChild((() => {
                        let p = document.createElement('li');
                        p.innerText = str;
                        return p;
                    })());
                } else {
                    consoleView.lastChild.innerText = str;
                }
            }
            if (curFiles.length === 0) {
                mylog('> No files currently selected for upload');
            } else {
                mylog('> onLoad...');
                var chunk_size = Math.pow(2, 4); //16
                for (const file of curFiles) {
                    var dec = new TextDecoder("utf-8");
                    var fileReader = new FileReader();
                    var size = file.size;
                    var name = file.name;
                    var offset = this.value.offset;
                    var self = this;
                    fileReader.readAsArrayBuffer(file);
                    fileReader.onload = function (e) {
                        mylog('> onLoad...done');

                        mylog(`> File name is "${name}".`);
                        mylog(`> File size is ${size} bytes.`);
                        mylog(`> file offset is ${offset} bytes.`);
                        self.value.data = e.target.result.slice(offset);
                        self.value.dataB = e.target.result.slice(0, chunk_size - 1);
                        self.value.dataA = self.value.data.slice(0, chunk_size - 1);
                        mylog(`> origin of ${chunk_size} bytes of fileData :"${dec.decode(self.value.dataB)}"`);
                        mylog(`> preview of ${chunk_size} bytes of fileData :"${dec.decode(self.value.dataA)}"`);
                        //console.log(self.value.data); // ArrayBuffer 객체
                        const mergedBlob = new Blob(
                            [self.value.data],
                            { type: 'application/octet-stream' }
                        );
                        self.value.url = window.URL.createObjectURL(mergedBlob);

                        console.log(self.value.url)
                        document.body.appendChild(() => {
                            let b = document.createElement('button');
                            b.innerText = 'download';
                            b.onclick = () => {
                                var a = document.createElement("a")
                                a.innerText = 'download';
                                a.href = self.value.url;
                                a.download = name;
                                document.body.appendChild(a);
                                a.click();
                                setTimeout(function () {
                                    document.body.removeChild(a);
                                    //window.URL.revokeObjectURL(url);
                                }, 0);
                            }
                            return b;
                        })();


                    }
                }
            }
        }
    }
    window.onload = () => main.init()
    return main;
})(main = {})