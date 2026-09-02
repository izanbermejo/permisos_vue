import { createApp } from "vue/dist/vue.esm-bundler";
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import i18n from './i18n/i18n'

import primevuei18n from "./i18n/primevuei18n";

// PrimeVue configuració
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
// PrimeVue components
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Row from 'primevue/row';
import Dropwdown from 'primevue/dropdown';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmPopup from 'primevue/confirmpopup';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Tooltip from 'primevue/tooltip';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import OverlayPanel from 'primevue/overlaypanel';
import MultiSelect from 'primevue/multiselect';
import Listbox from 'primevue/listbox';
import SelectButton from 'primevue/selectbutton';
import RadioButton from 'primevue/radiobutton';
import ScrollPanel from 'primevue/scrollpanel';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import Panel from 'primevue/panel'
import CalendarMod from './components/prime/CalendarMod';
import Checkbox from 'primevue/checkbox';
import ContextMenu from 'primevue/contextmenu';
import AutoComplete from 'primevue/autocomplete';

import LocalizedInputNumber from './components/prime/LocalizedInputNumber.vue';
import CalendarInput from "./components/prime/CalendarInput.vue";
import SetmanaInput from "./components/prime/SetmanaInput.vue";
import InfoTaulaBuida from "./components/InfoTaulaBuida.vue";
import ButtonShortcut from "./components/ButtonShortcut.vue";
import BadgeDirective from 'primevue/badgedirective';

import PluginComercial from "./plugins/PluginPermisos.js";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

// Loader (integrat amb les crides d'Axios)
import 'vue-loading-overlay/dist/vue-loading.css';

// Menú
import VueSidebarMenu from 'vue-sidebar-menu'
import './themes/vue-sidebar-menu.scss'

// Estil general
import './style/estil.css'

// Font Awesome (icones)
import './fontawesome'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Mitt (per eventBus)
import mitt from 'mitt';
const emitter = mitt();

// Keycloak
import keycloak, { usuari } from '@/keycloak/keycloak';

// Moment
import moment from "moment";
import PermisosService from "./services/permisos.service";

/*  Override la funció stringify per convertir les dates al format YYYY-MM-DD
*   ja que el component Calendar del PrimeVue afegeix la zona horaria
*   i llavors quan es rep al servidor es resta un dia a la data indicada */
let stringify_original = JSON.stringify;
JSON.stringify = function(o, r, s){
  r = function(key, value){
    if (this[key] instanceof Date) {
      return moment(this[key]).format('YYYY-MM-DD')
    }
    return value;
  }
  return stringify_original(o, r, s);
}

const app = createApp(App)
          .directive('tooltip', Tooltip)
          .use(createPinia())
          .use(i18n)
          .use(PrimeVue, {
              zIndex: {
                  modal: 1100,        //dialog, sidebar
                  overlay: 1300,      //dropdown, overlaypanel
                  menu: 1400,         //overlay menus
                  tooltip: 1200,       //tooltip
              }
          })
          .use(primevuei18n)
          .use(ConfirmationService)
          .use(ToastService)
          .use(VueSidebarMenu)
          .component('Button', Button)
          .component('Dialog', Dialog)
          .component('DataTable', DataTable)
          .component('Column', Column)
          .component('Row', Row)
          .component('Dropdown', Dropwdown)
          .component('ConfirmDialog', ConfirmDialog)
          .component('ConfirmPopup', ConfirmPopup)
          .component('Toast', Toast)
          .component('InputText', InputText)
          .component('InputNumber', InputNumber)
          .component('Textarea', Textarea)
          .component('OverlayPanel', OverlayPanel)
          .component('font-awesome-icon', FontAwesomeIcon)
          .component('Listbox', Listbox)
          .component('MultiSelect', MultiSelect)
          .component('SelectButton', SelectButton)
          .component('RadioButton', RadioButton)
          .component('ScrollPanel', ScrollPanel)
          .component('Checkbox', Checkbox)
          .component('Tag', Tag)
          .component('Divider', Divider)
          .component('Panel', Panel)
          .component('AutoComplete', AutoComplete)
          .component('Calendar', CalendarMod)
          .component('LocalizedInputNumber', LocalizedInputNumber)
          .component('CalendarInput', CalendarInput)
          .component('SetmanaInput', SetmanaInput)
          .component('ContextMenu', ContextMenu)
          .component('InfoTaulaBuida', InfoTaulaBuida)
          .component('ButtonShortcut', ButtonShortcut)
          .directive('badge', BadgeDirective)
          .provide('idiomesDisponibles', [
              {codi:'ca-ES',descripcio:'Català',entrada:true,iso:'ca'},
              {codi:'es-ES',descripcio:'Español',entrada:true,iso:'es'},
              {codi:'en-US',descripcio:'English',entrada:true,iso:'en'},
              {codi:'en-GB',descripcio:'English',entrada:true,iso:'en'},
              {codi:'hu-HU',descripcio:'Magyar',entrada:true,iso:'hu'},
              {codi:'zh-CN',descripcio:'中文',entrada:true,iso:'zh'}
              ])
          .provide('emitter', emitter);

// Store de permisos
import { usePermisosStore } from './stores/permisos';
import OrganigramaService from "./services/organigrama.service.js";
const permisosStore = usePermisosStore();

// Inicialització de KeyCloak
keycloak.init({onLoad: 'login-required', checkLoginIframe: false})
  .then(async (authenticated) => {
    if (!authenticated) {
      window.location.reload();
    } else {
      // Càrrega de permisos
      const permisos = await PermisosService.obtenirPermisos(usuari());
      permisosStore.setPermisos(permisos);

      // En cas que no tingui accés a cap mòdul, es mostra el missatge corresponent
      if (!permisosStore.teAccesAlgunModul()) {
        document.getElementById('permisos').style.visibility = 'visible';
      } else {
        // Càrrega de metadades
        const centres = await OrganigramaService.obtenirCentres();
        const departaments = await OrganigramaService.obtenirDepartaments();
        const funcions = await OrganigramaService.obtenirFuncions();
        const empleats = await OrganigramaService.obtenirEmpleats();
        const data = {
          centres: centres,
          departaments: departaments,
          funcions: funcions,
          empleats: empleats,
        };
        localStorage.setItem('metadata', JSON.stringify(data));

        // Inici de l'aplicació Vue
        app.use(PluginComercial)
          .use(router)
          .mount('#app');
      }

  }
})
  .catch(error => console.error("Error inicialitzant KeyCloak: ", error))
  .finally(() => document.getElementById('loader')?.remove());