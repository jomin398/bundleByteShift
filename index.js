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
        mylog(str, delLast, html) {
            let consoleView = document.body.querySelector('ul');
            if (!delLast) {
                let p = document.createElement('li');
                if (!html) {
                    p.innerText = str;
                }
                consoleView.appendChild(p);
                if (html) {
                    return p;
                }
            } else {
                if (!html) {
                    consoleView.lastChild.innerText = str;
                } else if (html) {
                    return consoleView.lastChild;
                }
            }
        };
        num2hex(n) {
            const h = '0123456789ABCDEF';
            return h[n >> 4] + h[n & 15]
        };

        hexTable = {
            s: this,
            el: null,
            init: function () {
                const t = document.createElement('table');
                t.className = 'hexTable';
                let l = 16;
                for (let i = 0; i < 2; i++) {
                    const w = document.createElement('tr');
                    for (let j = 0; j < l; j++) {
                        let d = document.createElement(i == 0 ? 'th' : 'td');
                        d.innerText = i == 0 ? this.s.num2hex(j) : '';
                        w.appendChild(d);
                    }
                    t.appendChild(w);
                }
                this.el = t;
                return t;
            },
            add: function (d) {
                const c = this.el.childNodes[1].childNodes;
                new Uint8Array(d).forEach((v, i) => { c[i].innerText = this.s.num2hex(v); });
            }
        }
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
        onLoadFile(curFiles) {
            this.mylog('> onLoad...');
            for (const file of curFiles) {
                var dec = new TextDecoder("utf-8");
                var fileReader = new FileReader();
                var size = file.size;
                var name = file.name;
                var offset = this.value.offset;
                var self = this;
                var chunk_size = Math.pow(2, 4); //16
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = function (e) {
                    self.mylog('> onLoad...done');

                    self.mylog(`> File name is "${name}".`);
                    self.mylog(`> File size is ${size} bytes.`);
                    self.mylog(`> file offset is ${offset} bytes.`);
                    self.value.data = e.target.result.slice(offset);
                    self.value.dataB = e.target.result.slice(0, chunk_size - 1);
                    self.value.dataA = self.value.data.slice(0, chunk_size - 1);
                    self.mylog(`> origin of ${chunk_size} bytes`);
                    self.mylog(`  fileData :"${dec.decode(self.value.dataB)}"`)
                    self.mylog(null, false, true).appendChild(self.hexTable.init());
                    self.hexTable.add(e.target.result.slice(0, chunk_size));
                    self.mylog(`> preview of ${chunk_size} bytes of edited fileData :"${dec.decode(self.value.dataA)}"`);
                    //console.log(self.value.data); // ArrayBuffer 객체
                    const mergedBlob = new Blob(
                        [self.value.data],
                        { type: 'application/octet-stream' }
                    );
                    self.value.url = window.URL.createObjectURL(mergedBlob);

                    console.log(self.value.url)
                    document.body.append((() => {
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
                    })(), document.createElement('br'), (() => {
                        let b = document.createElement('button');
                        b.innerText = 'Page Reload';
                        b.onclick = () => {
                            window.URL.revokeObjectURL(self.value.url);
                            location.reload();
                        };
                        return b;
                    })());


                }
            }
        }
        submitHandler() {
            // console.log(this.form)
            this.value.offset = Number(this.form.querySelector('input[type=number]').value);
            const curFiles = this.form.querySelector('input[type=file]').files;
            this.form.style.display = 'none';
            const consoleView = document.createElement('ul');
            document.body.appendChild(consoleView);
            if (curFiles.length === 0) {
                this.mylog('> No files currently selected for upload');
            } else {
                this.onLoadFile(curFiles);
            }
        }
    }
    window.onload = () => main.init()
    return main;
})(main = {})