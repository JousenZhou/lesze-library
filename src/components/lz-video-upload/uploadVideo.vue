<template>
    <div class="upload-glass" v-if="visible">
        <div class="content">
            <template v-if="errorWarningList.length">
                <header>文件导入失败</header>
                <section>
                    <article>
                        <p>
                            <span>文件名</span>
                            <span>失败原因</span>
                        </p>
                        <p v-for="(item, index) in errorWarningList" :key="index">
                            <span :title="item.name">{{ item.name }}</span>
                            <span :title="item.error">{{ item.error }}</span>
                        </p>
                    </article>
                </section>
                <footer>
                    <button @click.stop="errorWarningList = []">知道了</button>
                </footer>
            </template>
            <template v-else>
                <header>上传视频</header>
                <section v-if="videoUpload.status">
                    <span v-if="videoUpload.text">{{ videoUpload.text }}</span>
                    <el-progress ref="progress" v-else type="circle" :status="progressStatus" :stroke-width="12" :percentage="videoUpload.percent" />
                </section>
                <section v-else>
                    <p>
                        <span
                            v-for="(em, index) in ['本地视频', '视频链接']"
                            :key="index"
                            :active="String(uploadType === index)"
                            @click="uploadType = index"
                            >{{ em }}</span
                        >
                    </p>
                    <div v-if="uploadType === 0" class="drag" :contentEditable="true" @drop="drag" @click="uploadManual">
                        <ul v-if="taskFiles.length">
                            <li v-for="(item, index) in taskFiles" :key="index" @click.stop="currentPreviewUrl = item.url">
                                <video
                                    v-if="!item['blob-FirstFrame']"
                                    style="display: none"
                                    crossorigin="anonymous"
                                    muted
                                    autoplay
                                    @loadeddata="loadeddata($event, item)"
                                >
                                    <source :src="item.url" @error="error($event, item)" />
                                </video>
                                <img v-else :src="item['blob-FirstFrame']" alt="666" />
                                <svg-icon icon-class="icon-close" class="close" @click.stop.native="taskFiles.splice(index, 1)" />
                            </li>
                        </ul>
                        <p v-else>
                            将视频拖放到此处上传，或点击上传
                        </p>
                    </div>
                    <div v-else class="link">
                        <div>视频地址</div>
                        <label>
                            <textarea v-model="textarea"></textarea>
                            <span>
                                <label>视频地址以;号隔开,仅支持{{ _accept_.join(',') }}视频格式!</label>
                                <button @click.stop="insert">导入</button></span
                            >
                        </label>
                    </div>
                </section>
                <footer>
                    <template v-if="!videoUpload.status">
                        <button @click.stop="cancel" :disabled="videoUpload.status">取消</button>
                        <button @click.stop="determine" :disabled="videoUpload.status">上传</button>
                    </template>
                    <button class="suspension" v-else-if="videoUpload.status && typeof videoUpload.suspension === 'function'" @click="stopUpload">中止上传</button>
                </footer>
            </template>
        </div>
        <!--预览视频弹窗-->
        <video-preview :url.sync="currentPreviewUrl" />
    </div>
</template>

<script>
import Component, { mixins } from 'vue-class-component';
import { Watch, Prop } from 'vue-property-decorator';
import videoPreview from './video-preview.vue';
/* [video/*] 将映射成下列文件格式*/
let videoAccept = ['ogm', 'wmv', 'mpg', 'webm', 'ogv', 'mov', 'asx', 'mpeg', 'mp4', 'm4v', 'avi'];

let defaultConfig = {
    // 视频格式
    accept: 'video/*', //'.mp4,.ogg,.webm',
    limit: 20,
    size: 20
};
@Component({
    name: 'uploadVideo',
    components: {
        videoPreview
    }
})
export default class App extends mixins() {
    @Prop({ default: () => {}, type: Object }) options;
    // 上传类型 0 本地视频 2视频链接
    uploadType = 0;
    // 预览地址
    currentPreviewUrl = null;
    // 任务列表
    taskFiles = [];
    visible = false;
    config = {};
    // 上传进度
    videoUpload = {
        percent: 0,
        status: false,
        requestStatus: null,
        // 终止上传函数
        suspension: null
    };
    // 视频地址文本
    textarea = '';
    // 解析不符合规则的文件
    errorWarningList = [];
    // 解析后的文件格式
    _accept_ = [];
    // 上传状态
    get progressStatus() {
        switch (this.videoUpload.requestStatus) {
            case true:
                return 'success';
            case false:
                return 'exception';
            default:
                return undefined;
        }
    }
    @Watch('options', { deep: true, immediate: true })
    onConfigChange(value) {
        this.$set(this, 'config', { ...defaultConfig, ...value });
        let { accept } = this.config;
        this._accept_ = accept === 'video/*' ? videoAccept : accept.split(',').map((em) => em.split('.')[1]);
    }
    // 终止上传
    async stopUpload() {
        this.videoUpload.suspension();
        this.$set(this, 'videoUpload', {
            percent: 0,
            status: false,
            requestStatus: null,
            suspension: null
        });
    }
    // 拖拽上传
    drag(e) {
        e.preventDefault();
        this.sourceVerify(e.dataTransfer.files);
    }
    // 引入
    insert() {
        let { textarea, fileExtension, _accept_, config, taskFiles } = this;
        if (textarea.length > 0) {
            let array = textarea.split(';');
            let errorWarningList = {};
            let { limit } = config;
            array.forEach((em, index) => {
                let status = true;
                // 校验后缀格式
                let ext = fileExtension(em);
                // 判断格式
                if (!_accept_.includes(ext)) {
                    status = false;
                    errorWarningList[index] = {
                        name: em,
                        error: '格式不正确'
                    };
                }
                // 校验是否超出上传限制
                if (taskFiles.length + index + 1 > limit) {
                    status = false;
                    if (errorWarningList[index]) {
                        errorWarningList[index].error = `${errorWarningList[index].error};超出最大上传数`;
                    } else {
                        errorWarningList[index] = {
                            name: em,
                            error: `超出最大上传数`
                        };
                    }
                }
                // 校验成功
                if (status) {
                    this.taskFiles.push({
                        url: em
                    });
                }
            });
            // 对象转数组
            this.errorWarningList = Object.values(errorWarningList);
            this.uploadType = 0;
        }
        this.textarea = '';
    }
    // 加载视频资源
    loadeddata(e, item) {
        setTimeout(() => {
            let canvas = document.createElement('canvas');
            let width = e.target.videoWidth;
            let height = e.target.videoHeight;
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(e.target, 0, 0, width, height);
            let dataURL = canvas.toDataURL('image/png');
            this.$set(item, 'blob-FirstFrame', dataURL);
        }, 1000);
    }
    // 获取资源扩展名
    fileExtension(fileName) {
        return fileName
            .split('.')
            .pop()
            .toLowerCase();
    }
    // 资源检验
    sourceVerify(files) {
        let { fileExtension, _accept_ } = this;
        let { size } = this.config;
        // 错误的文件
        let errorWarningList = {};
        // 当前匹配的资源
        files.forEach((em, index) => {
            let ext = fileExtension(em.name);
            let _size_ = (em.size / 1024 / 1024).toFixed(0);
            let status = true;
            // 判断格式
            if (!_accept_.includes(ext)) {
                status = false;
                errorWarningList[index] = {
                    name: em.name,
                    error: '格式不正确'
                };
            }
            // 判断大小
            if (_size_ > size) {
                status = false;
                if (errorWarningList[index]) {
                    errorWarningList[index].error = `${errorWarningList[index].error};体积过大`;
                } else {
                    errorWarningList[index] = {
                        name: em.name,
                        error: `体积过大`
                    };
                }
            }
            // 校验成功
            if (status) {
                this.taskFiles.push({
                    file: em,
                    url: URL.createObjectURL(new Blob([em]))
                });
            }
        });
        // 对象转数组
        this.errorWarningList = Object.values(errorWarningList);
    }
    // 点击上传
    uploadManual() {
        if (this.taskFiles.length < this.config.limit) {
            let up = document.createElement('input');
            up.setAttribute('type', 'file');
            up.setAttribute('accept', this.config.accept);
            up.setAttribute('multiple', String(this.config.limit - this.taskFiles.length > 1));
            up.addEventListener('change', (event) => {
                this.sourceVerify(event.target.files);
            });
            up.click();
        }
    }
    // 视频加载是啊比
    error(e, item) {
        // this.$message.warning(`${item.url}视频加载失败`);
        setTimeout(() => {
            let index = this.taskFiles.findIndex((em) => em.url === item.url);
            if (~index) {
                this.taskFiles.splice(index, 1);
            }
        }, (Math.random() * 10 + 5) * 100);
    }
    // 打开弹窗
    $view(parameter, callback, destroy) {
        return new Promise((resolve) => {
            for (let key in parameter) {
                this.$set(this.config, key, parameter[key]);
            }
            this.visible = true;
            if (callback) {
                this.determine = async () => {
                    this.videoUpload.status = true;
                    let res = await callback(this.taskFiles, this.videoUpload);
                    this.videoUpload.percent = res === true ? 100 : this.videoUpload.percent;
                    setTimeout(() => {
                        this.videoUpload.requestStatus = res === true;
                        setTimeout(() => {
                            if (res === true) {
                                this.visible = false;
                            } else {
                                this.videoUpload.status = false;
                                this.videoUpload.percent = 0;
                                this.videoUpload.requestStatus = null;
                            }
                        }, 800);
                    }, 800);
                };
            }
            // 创建一个监听器
            this.$watch('visible', (status) => {
                if (status === false) {
                    destroy();
                    resolve();
                }
            });
        });
    }
    // 取消
    cancel() {
        this.visible = false;
    }
    // 确定
    determine() {
        this.visible = false;
    }
}
</script>
<style lang="scss" scoped>
.upload-glass {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    .content {
        margin-top: -10%;
        width: 460px;
        height: 310px;
        display: flex;
        flex-direction: column;
        background: white;
        position: relative;
        header {
            height: 40px;
            border-bottom: 1px #dedede solid;
            padding: 0 10px;
            line-height: 40px;
            font-weight: bold;
        }
        section {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            > p {
                margin: 0;
                padding: 0 20px;
                height: 36px;
                line-height: 36px;
                span {
                    cursor: pointer;
                    margin-right: 20px;
                    &[active='true'] {
                        color: #00a0e9;
                        text-decoration: underline #00a0e9;
                    }
                }
            }
            > div {
                flex: 1;
                overflow: hidden;
                margin: 0 20px 20px 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                p {
                    color: #bdbdbd;
                }
                &[class='drag'] {
                    cursor: pointer;
                    outline: none;
                    border: 2px #dedede dashed;
                    flex-direction: column;
                    ul {
                        padding: 10px;
                        flex: 1;
                        width: calc(100% - 20px);
                        overflow-y: scroll;
                        li {
                            float: left;
                            list-style: none;
                            width: 50px;
                            height: 50px;
                            border: 2px #dedede dashed;
                            cursor: pointer;
                            position: relative;
                            &:nth-of-type(n + 1) {
                                margin-right: 10px;
                                margin-bottom: 10px;
                            }
                            flex-direction: column;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            img {
                                width: 100%;
                            }
                            .close {
                                position: absolute;
                                font-size: 20px;
                                right: -7px;
                                top: -7px;
                                border-radius: 50%;
                                background: #ff5783;
                                cursor: pointer;
                            }
                        }
                    }
                }
                &[class='link'] {
                    padding: 10px 0 0 0;
                    display: flex;
                    align-items: flex-start;
                    > div {
                        width: 80px;
                    }
                    > label {
                        height: 100%;
                        flex: 1;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        textarea {
                            width: 90%;
                            resize: none;
                            outline: none;
                            border: 2px #dedede dashed;
                            height: 100px;
                        }
                        span {
                            flex: 1;
                            overflow: hidden;
                            width: 90%;
                            font-size: 12px;
                            color: #a0a0a0;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            button {
                                margin-left: 10px;
                                width: 50px;
                                padding: 0;
                                border-radius: 3px;
                                height: 26px;
                                border: 1px #e1e1e1 solid;
                                background: rgba(242, 242, 242, 1);
                                font-size: 14px;
                                cursor: pointer;
                                font-weight: bold;
                                &:hover {
                                    color: black;
                                }
                            }
                            label {
                                flex: 1;
                                word-wrap: break-word;
                                white-space: normal;
                                word-break: break-all;
                            }
                        }
                    }
                }
            }
            > article {
                height: 100%;
                border: 2px #dedede dashed;
                margin: 10px;
                p {
                    border-bottom: 1px #dedede solid;
                    height: 28px;
                    line-height: 28px;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    color: rgb(96, 98, 102);
                    span {
                        font-size: 12px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        padding: 0 6px;
                        &:nth-of-type(1) {
                            flex: 1;
                            border-right: 1px #dedede solid;
                        }
                        &:nth-of-type(2) {
                            width: 200px;
                        }
                    }
                    &:nth-of-type(1) {
                        background: #f7f8fa;
                        font-weight: bold;
                    }
                }
            }
        }
        footer {
            height: 40px;
            border-top: 1px #dedede solid;
            display: flex;
            padding: 0 10px;
            justify-content: flex-end;
            align-items: center;
            button {
                height: 28px;
                width: 80px;
                margin-left: 10px;
                cursor: pointer;
                border-radius: 3px;
                &[class='suspension']{
                  &:hover {
                    border-color: #ff5783 !important;
                    color: #ff5783 !important;
                  }
                }
                &:nth-of-type(1) {
                    background: white;
                    border: #a0a0a0 1px solid;
                    &:hover {
                        border-color: #00a0e9;
                        color: #00a0e9;
                    }
                }
                &:nth-of-type(2) {
                    background: #00a0e9;
                    color: white;
                    border: #00a0e9 1px solid;
                    &:hover {
                        background: rgba(0, 160, 233, 0.8);
                        border-color: rgba(0, 160, 233, 0.8);
                    }
                }
            }
        }
    }
    li,
    ul,
    p {
        padding: 0;
        margin: 0;
    }
}
*::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

/*滚动条的轨道*/
*::-webkit-scrollbar-track {
    background-color: #ffffff;
}

/*滚动条里面的小方块，能向上向下移动*/
*::-webkit-scrollbar-thumb {
    background-color: #f9f9f9;
    border-radius: 5px;
    border: 1px solid #f1f1f1;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
}

*::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
}

*::-webkit-scrollbar-thumb:active {
    background-color: #787878;
}

/*边角，即两个滚动条的交汇处*/
*::-webkit-scrollbar-corner {
    background-color: #ffffff;
}
</style>
<style lang="scss">
.el-progress__text {
    i {
        font-size: 30px;
        font-weight: bold;
        &[class='el-icon-close'] {
            &:after {
                content: '×';
            }
        }
        &[class='el-icon-check'] {
            &:after {
                content: '√';
            }
        }
    }
}
</style>
