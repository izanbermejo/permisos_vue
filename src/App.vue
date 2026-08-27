<template>
  <Toast />
  <ConfirmDialog />
  <sidebar-menu
    v-model:collapsed="collapsed"
    :menu="menu"
    :hideToggle= "true"
    :show-one-child="true"
    theme='comercial-theme'
    :style="{'background-color': !isEntornProduccio ? ' #ff0000' : ''}"
  > <!-- @update:collapsed="onToggleCollapse" @item-click="onItemClick" -->
  <template v-slot:header>
    <div style="white-space: nowrap;">
      <img src="@/assets/logo.png" style="margin :5px;" alt="Logo" />
      <span v-if="!collapsed" id="titol" class="titol">{{ $t('App.Titol') }}
        <sub style="font-size: 12px">{{ appVersion }}</sub>
      </span>
    </div>
  </template>
  <template v-slot:footer>
    <div style="display:flex; white-space: nowrap; margin-left: 15px; margin-bottom: 80px;">
      <span style="cursor: pointer;" @click="logout">
        <font-awesome-icon icon="fa-solid fa-power-off" style="font-size: 1.5rem; color: white;" />
        <span v-if="!collapsed" class="sortir">{{ $t('App.Sortir') }}</span>
      </span>
    </div>
    <div style="display:flex; white-space: nowrap; margin-left: 15px; margin-bottom: 20px;">
      <font-awesome-icon icon="fa-solid fa-copyright" style="font-size: 1.5rem; color: white;" />
      <span v-if="!collapsed" class="copyright" style="margin-left: 10px">IT AMES GROUP 2024</span>
    </div>
  </template>
  </sidebar-menu>
  <div
    v-if="isOnMobile && !collapsed"
    class="sidebar-overlay"
    @click="collapsed = true"
  />
  <div
    id="container"
    :class="[{'collapsed' : collapsed}, {'onmobile' : isOnMobile}]"
  >
    <div id="barra" style="display: flex; justify-content: space-between;"
        :style="{'background-color': !isEntornProduccio ? ' #ff0000' : ''}">
      <div>
        <button class="btn btn-secondary" @click="colapsaMostraMenu()">
          <i>
          <font-awesome-icon icon="fa-solid fa-bars" /></i>
        </button>
        <span v-if="!isEntornProduccio" style="font-size: 20px; font-weight: 600; color: white;">
          ENTORN DE PROVES
        </span>
      </div>
      <span style="margin-left: auto;">
        <span class="usuari"> {{ nomUsuari() }} </span>
        <SelectorIdioma />
      </span>
    </div>
    <div id="subcontainer">
      <router-view />
    </div>
  </div>
</template>

<script>
import { h, markRaw, inject, onMounted, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import SelectorIdioma from '@/components/SelectorIdioma.vue'
import i18n from '@/i18n/i18n'
import { usePrimeVue } from "primevue/config";
import keycloak, {nomUsuari} from './keycloak/keycloak'
import { useConfirm } from "primevue/useconfirm";

export default {
  name : 'App',
  components : {
    SelectorIdioma
  },
  setup() {
    const { t, locale } = i18n.global;
    const appVersion = process.env.VUE_APP_VERSION;
    const isEntornProduccio = process.env.NODE_ENV === 'production';
    const separator = {
      template: '<hr class="bg-light border-2 border-top border-light" style="margin: 10px">'
    }

    const collapsed = ref();
    const isOnMobile = ref();
    const confirm = useConfirm();


    const faIcon = (props) => {
      return {
        element: markRaw({
          render: () => h('div', [
            h(FontAwesomeIcon, { size: 'lg', ...props })
          ])
        })
      }
    }


    onMounted(() => {
      onResize();
      window.addEventListener('resize', onResize);
      // Idioma al localStorage
      locale.value = localStorage.getItem('idioma') ? localStorage.getItem('idioma') : 'ca-ES';
      // Traduccions Prime
      const translatePrime = inject('translatePrime');
      const primevue = usePrimeVue();
      translatePrime(primevue);
      // Títol
    });

    const onResize = () => {
      if (window.innerWidth <= 767) {
        isOnMobile.value = true
        collapsed.value = true
      } else {
        isOnMobile.value = false
        collapsed.value = false
      }
    }

    const colapsaMostraMenu = () => {
      collapsed.value = !collapsed.value;
    }

    const logout = () => {
      confirm.require({
        header: t('App.Confirmacio'),
        message: t('App.Confirma sortir'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          keycloak.logout();
        }
      });
    }

    const buildMenu = () => {
      return [
          {
            component: markRaw(separator)
          },
          {
            href: '/aplicacions',
            title: t('App.Aplicacions'),
            icon: faIcon({ icon: 'fa-solid fa-grip' }),
            // hidden: !permisosStore.teModul('TARIFES')
          },
          {
            href: '/moduls',
            title: t('App.Moduls'),
            icon: faIcon({ icon: 'fa-solid fa-layer-group' })
          },
          {
            href: '/permisos',
            title: t('App.Permisos'),
            icon: faIcon({ icon: 'fa-solid fa-user-lock' })
          },
          {
            href: '/parametres',
            title: t('App.Parametres'),
            icon: faIcon({ icon: 'fa-solid fa-list' })
          },
        ]}

    // eslint-disable-next-line
    watch(locale, (newLocale) => {
      menu.value = buildMenu();
    });

    const menu = ref(buildMenu());
    
    return {
        appVersion,
        isEntornProduccio,
        faIcon,
        separator,
        isOnMobile,
        collapsed,
        colapsaMostraMenu,
        menu,
        logout,
        nomUsuari
    }
  }
}
</script>


<style lang="scss">
@font-face {
  font-family: 'Source Sans Pro';
  src: url('@/assets/fonts/SourceSansPro-Regular.otf.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Source Sans Pro';
  src: url('@/assets/fonts/SourceSansPro-Semibold.otf.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

body,
html {
  margin: 0;
  padding: 0;
  scroll-behavior: auto;
  background-image: url('@/assets/background.png');
}

#container {
  padding-left: 290px;
  transition: 0.3s ease;
}

#container.collapsed {
  padding-left: 65px;
}

#container.onmobile {
  padding-left: 65px;
}

.sidebar-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #000;
  opacity: 0.5;
  z-index: 900;
}

.container {
  padding: 50px;
}

#barra {
  background-color: #2a2a2e;
  padding: 5px 25px 5px 0px;
}

#subcontainer {
  padding: 5px 3px 0px 3px;
}

#titol {
  color: white;
  text-align: center;
  vertical-align: middle;
  margin-left: 10px;
  font-size: 150%;
}

.usuari {
  color: white;
  margin-right: 30px;
  font-size: 120%;
  vertical-align: middle;
}

.sortir {
  color: white;
  margin-left: 10px;
  font-size: 105%;
}

.copyright {
  font-style: italic;
  font-size: 95%;
  color: white;
}

/** Necessari per a que les alertes de SweetAlert estiguin per sobre (index z) de qualsevol modal, etc. */
.swal2-container {
  z-index: 9999 !important;
}

.badge-count {
  background-color: #00FF00;
  border-radius: 100%;
  margin-left: 5px;
  padding: 1px 7px;
  color: black;
}

</style>
