export default {
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
};
