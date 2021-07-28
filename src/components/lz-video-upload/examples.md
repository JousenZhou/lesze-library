视频上传(组件式)

```vue
<template>
    <lz-video-upload :disabled="false" v-model="videoList" :config="config" :on-upload="upload" />
</template>

<script>
export default {
    data() {
        return {
            videoList: [],
            config: {
                limit: 2,
                accept: '.mp4', // 'video/*' 👈所有视频格式
                size: 20
            },
            // axios请求模拟
            axios: {
                put: (url, data, options) => {
                    return new Promise((resolve) => {
                        let res = data.map((em) => {
                            return {
                                url: em.url
                            };
                        });
                        let total = 100;
                        let loaded = 0;
                        let r = setInterval(() => {
                            loaded += 10;
                            options.onUploadProgress({ total, loaded });
                            if (total === loaded) {
                                window.clearInterval(r);
                                resolve(res);
                            }
                        }, 500);
                    });
                }
            }
        };
    },
    methods: {
        // 上传执行函数
        async upload(file, feedback) {
            // 设置停止上传  只要赋值suspension为函数即可设置终止操作按钮
            feedback.suspension = () => {
                // axios的config中提供了一个cancelToken属性，可以通过传递一个新的CancelToken对象来在请求的任何阶段关闭请求。
                // let CancelToken = axios.CancelToken;
                // let source = CancelToken.source();
                // source.cancel('中止上传');
                // source = CancelToken.source();
            };
            // 这里的格式按照axios的方法
            const data = new FormData();
            data.append('file', file);
            let res = await this.axios.put('/xxx', file, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    feedback.percent = ((progressEvent.loaded / progressEvent.total) * 100) | 0;
                }
            });
            return res;
        }
    }
};
</script>
```

函数式
