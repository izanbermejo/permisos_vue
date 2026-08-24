import { ref } from 'vue';
import { useLoading } from 'vue-loading-overlay';

const $loading = useLoading();
const isLoading = ref(false);

const carrega = async (funcio) => {
    isLoading.value = true;
    const loader = $loading.show({
        canCancel: false,
        enforceFocus: false,
    });

    try {
        const resp = await funcio;
        return resp;
    } finally {
        loader.hide();
        isLoading.value = false;
    }
};

export { carrega, isLoading };