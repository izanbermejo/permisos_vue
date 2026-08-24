import Calendar from 'primevue/calendar'

import {defineComponent} from 'vue'

export default defineComponent({
    extends: Calendar,
    methods: {
        updateFocus: () => {
            /* Prevents primevue's default behaviour. */
        }
    }
})