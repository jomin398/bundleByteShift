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
        hexManager = {
            s: this,
            el: null,
            num2hex(n) {
                const h = '0123456789ABCDEF';
                return h[n >> 4] + h[n & 15]
            },
            tableInit: function () {
                const t = document.createElement('table');
                t.className = 'hexTable';
                let l = 16;
                for (let i = 0; i < 2; i++) {
                    const w = document.createElement('tr');
                    for (let j = 0; j < l; j++) {
                        let d = document.createElement(i == 0 ? 'th' : 'td');
                        d.innerText = i == 0 ? this.num2hex(j) : '';
                        w.appendChild(d);
                    }
                    t.appendChild(w);
                }
                this.el = t;
                return t;
            },
            add: function (d) {
                const c = this.el.childNodes[1].childNodes;
                new Uint8Array(d).forEach((v, i) => { c[i].innerText = this.num2hex(v); });
            },
            bufferToHex: function (d) {
                let c = '';
                new Uint8Array(d).forEach((v, i) => { c += this.num2hex(v); });
                return c;
            },
            viewer: function (bef, aft, textElmGenFn, cks) {
                this.s.mylog(null, false, true).append(
                    textElmGenFn(bef, cks),
                    this.tableInit()
                );
                this.add(aft.slice(0, cks));
            }
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
        };
        fileProcess(file, e) {
            // var self = this;
            var dec = new TextDecoder("utf-8");
            var size = file.size;
            var name = file.name;
            var offset = this.value.offset;
            var chunk_size = Math.pow(2, 4); //16
            [null, name, size, offset].map((e, i) => {
                switch (i) {
                    case 0:
                        this.mylog('> onLoad...done');
                        break;
                    case 1:
                        this.mylog(`> File name is "${e[i]}".`);
                        break;
                    case 2:
                        this.mylog(`> File size is ${e[i]} bytes.`);
                        break;
                    case 3:
                        this.mylog(`> file offset is ${e[i]} bytes.`);
                        break;
                    default:
                        break;
                }
            });
            this.value.data = e.target.result.slice(offset);
            this.value.dataB = e.target.result.slice(0, chunk_size - 1);
            this.value.dataA = this.value.data.slice(0, chunk_size - 1);
            const arr = [
                [this.value.dataB, e.target.result, (b, c) => {
                    let e = document.createElement('p');
                    e.innerText = `${c} bytes preview to be edited.
                fileData :"${dec.decode(b)}"`;
                    return e;
                }],
                [this.value.dataA, this.value.data, (b, c) => {
                    let e = document.createElement('p');
                    e.innerText = `edited ${c} bytes preview.
                fileData :"${dec.decode(b)}"`;
                    return e;
                }]
            ];
            arr.map(e => this.hexManager.viewer(e[0], e[1], e[2], chunk_size));

            const mergedBlob = new Blob(
                [this.value.data],
                { type: 'application/octet-stream' }
            );
            this.value.url = window.URL.createObjectURL(mergedBlob);

            console.log(this.value.url)
            const button = (() => {
                let b = document.createElement('button');
                b.innerText = 'Download then Reload Page';
                b.onclick = () => {
                    var a = document.createElement("a")
                    a.innerText = 'download';
                    a.href = this.value.url;
                    a.download = name;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function () {
                        window.URL.revokeObjectURL(a.href);
                        document.body.removeChild(a);
                        location.reload();
                        //window.URL.revokeObjectURL(url);
                    }, 0);
                }
                return b;
            })();
            document.body.append(button);
        };
        fileItemHandler(file) {
            var fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = (e) => this.fileProcess(file, e);
        };
        onLoadFile(curFiles) {
            this.mylog('> onLoad...');
            for (const file of curFiles) {
                this.fileItemHandler(file);
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