视频上传(组件式)

```vue
<template>
    <lz-video-upload :disabled="false" v-model="videoList" :config="config" :on-upload="upload" />
</template>

<script>
import axios from '../../mock';
export default {
    data() {
        return {
            videoList: [],
            config: {
                limit: 2,
                accept: '.mp4', // 'video/*' 👈所有视频格式
                size: 20
            }
        };
    },
    methods: {
        // 上传执行函数
        async upload(file, feedback) {
            // 请不要解构feedback 指针会丢失
            // let { suspension, percent } = feedback;

            // 设置终止上传  只需赋值suspension为函数即可设置终止操作按钮
            feedback.suspension = () => {
                // axios的config中提供了一个cancelToken属性，可以通过传递一个新的CancelToken对象来在请求的任何阶段关闭请求。
                // let CancelToken = axios.CancelToken;
                // let source = CancelToken.source();
                // source.cancel('中止上传');
                // source = CancelToken.source();
            };
            const data = new FormData();
            data.append('file', file);

            return await axios.put('/xxx', file, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    feedback.percent = ((progressEvent.loaded / progressEvent.total) * 100) | 0;
                }
            });
        }
    }
};
</script>
```

函数式
