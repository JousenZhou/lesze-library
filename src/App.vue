<template>
    <div>
        <upload-video />
    </div>
</template>

<script>
import Component, { mixins } from 'vue-class-component';
import { Watch, Prop } from 'vue-property-decorator';
@Component({
    name: 'app',
    components: {
        uploadVideo: () => import('./components/lz-video-upload/index.vue')
    }
})
export default class App extends mixins() {}
</script>
<style lang="scss">
* {
    font-family: Microsoft YaHei, Avenir, Helvetica, Arial, sans-serif;
}
</style>
