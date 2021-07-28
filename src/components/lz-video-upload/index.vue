<template>
    <div>
        <ul class="video">
            <li v-for="(item, index) in videoList" :key="index" @click.stop="openVideo(item.url)">
                <video
                    v-if="!item['blob-FirstFrame']"
                    style="display: none"
                    crossorigin="anonymous"
                    muted
                    autoplay
                    @loadeddata="loadeddata($event, item)"
                >
                    <source :src="item.url" />
                </video>
                <img v-else :src="item['blob-FirstFrame']" alt="666" />
                <svg-icon icon-class="icon-close" v-if="!disabled" class="close" @click.stop.native="videoList.splice(index, 1)" />
            </li>
            <li v-if="builtInConfig.limit > videoList.length" @click="upload">
                <svg-icon class="icon-add" icon-class="icon-add" />
            </li>
        </ul>
        <!--预览视频弹窗-->
        <video-preview :url.sync="currentPreviewUrl" />
    </div>
</template>

<script>
let defaultConfig = {
    limit: Infinity,
    accept: 'video/*',
    size: 20
};
import Component, { mixins } from 'vue-class-component';
import { Prop, Watch, PropSync } from 'vue-property-decorator';
import messageCarrier from './index.js';
import uploadVideo from './uploadVideo.vue';
import videoPreview from './video-preview.vue';
import Vue from 'vue';
import svgIcon from '../../plugins/svg-icon/index.js';
import { Progress } from 'element-ui';
Vue.use(svgIcon, require.context(`../../svg`, false, /\.svg$/));
Vue.use(Progress);
@Component({
    name: 'lz-video-upload',
    components: {
        videoPreview
    }
})
export default class App extends mixins() {
    /**
     * 视频数组数据  @v-model
     * @values [{url:'xxx.mp4'}]
     * @model
     */
    @Prop({ type: Array, required: true }) value;
    /**
     * 配置项(参数见下)
     * @values {
     *    accept: 'video/*',
          limit: 20,
          size: 20
     * }
     */
    @Prop({ required: false, type: Object, default: () => {} }) config;
    /**
     * 上传函数
     * @values  function(fileList, feedback:{ percent:number , suspension:Function })
     */
    @Prop({ required: true, type: Function }) onUpload;
    /**
     * 是否禁用
     * @values  true|false
     */
    @Prop({ type: Boolean, default: false }) disabled;
    get videoList() {
        return this.value;
    }
    set videoList(value) {
        /**
         * value @v-model
         * @property value
         * */
        this.$emit('input', value);
    }
    // 内置config
    builtInConfig = {};
    // 预览视频
    currentPreviewUrl = null;
    @Watch('config', { immediate: true })
    onConfigChange(config) {
        this.builtInConfig = { ...defaultConfig, ...config };
    }
    // 读取第一帧
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
    // 预览视频
    openVideo(url) {
        this.currentPreviewUrl = url;
    }
    // 上传弹窗
    async upload() {
        if (!this.disabled) {
            await messageCarrier(uploadVideo, { ...this.config }, async (file, feedback) => {
                let result = await this.onUpload(file, feedback);
                this.videoList = Array.isArray(result) ? [...this.videoList, ...result] : this.videoList;
                return Array.isArray(result) ? result.length > 0 : false;
            });
        }
    }
}
</script>
<style lang="scss" scoped>
.video {
    li {
        float: left;
        list-style: none;
        width: 100px;
        height: 100px;
        border: 2px #dedede dashed;
        cursor: pointer;
        position: relative;
        &:nth-of-type(n + 2) {
            margin-left: 10px;
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
            background: white;
            cursor: pointer;
        }
        .icon-add {
            color: #dedede;
            font-size: 25px;
        }
    }
}
</style>
<style lang="scss">
@import '~element-ui/lib/theme-chalk/progress.css';
</style>
