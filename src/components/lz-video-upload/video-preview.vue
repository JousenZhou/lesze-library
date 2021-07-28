<template>
    <div class="glass-video-preview" v-if="currentPreviewUrl">
        <div>
            <video ref="video" controls crossorigin="anonymous">
                <source :src="currentPreviewUrl" />
            </video>
        </div>
        <svg-icon icon-class="icon-close" class="close" @click.stop.native="currentPreviewUrl = null" />
    </div>
</template>

<script>
import Component, { mixins } from 'vue-class-component';
import { Watch, Prop, PropSync } from 'vue-property-decorator';
@Component({
    name: 'video-preview',
    components: {}
})
export default class App extends mixins() {
    @PropSync('url') currentPreviewUrl;
}
</script>
<style lang="scss" scoped>
.glass-video-preview {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    > div {
        margin-top: -10%;
        width: 50%;
        height: 50%;
        video {
            width: 100%;
            height: 100%;
        }
    }
    .close {
        font-size: 50px;
        position: absolute;
        right: 0;
        top: 0;
        cursor: pointer;
        border-radius: 50%;
        transform: translateX(-50%) translateY(50%);
        background: #ff5783;
    }
}
</style>
