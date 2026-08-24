import { createRouter, createWebHistory } from 'vue-router'
import { usePermisosStore } from '@/stores/permisos';

function lazyView(view) {
  return () => import(/* webpackChunkName: "lazy-view-[request]" */ `../views/${view}.vue`)
}

const routes = [
  {
    path: '/',
    redirect: '/comandes'
  },
  {
    path: '/errorpermisos',
    component: lazyView('ErrorPermisosView'),
  },
  {
    name: 'comandes',
    path: '/comandes',
    component: lazyView('ComandesView'),
    meta: {modul: 'COMANDES'}
  },
  {
    name: 'propostes',
    path: '/propostes',
    component: lazyView('PropostesView'),
    meta: {modul: 'PROPOSTES'}
  },
  {
    name: 'albarans',
    path: '/albarans',
    component: lazyView('AlbaransView'),
    meta: {modul: 'ALBARANS'}
  },
  {
    name: 'tarifes',
    path: '/tarifes',
    component: lazyView('TarifesView'),
    meta: {modul: 'TARIFES'}
  },
  {
    path: '/comandesEDI',
    component: lazyView('ComandesEDIEmptyView'),
    children: [{
      name: 'comandesEDI',
      path: '',
      component: lazyView('ComandesEDIView'),
      meta: {
        modul: 'COMANDES_EDI',
        scrollPos: {
            top: 0,
            left: 0,
        },
      },
    }, {
      name: 'liniesEDI',
      path: '/comandesEDI/linies/:id',
      component: lazyView('LiniesEDIView')
    },
    {
      name: 'liniesEDIfirst',
      path: '/comandesEDI/linies/comandes/EDI/linies/:codiComanda?first_article',
      component: lazyView('LiniesEDIView')
    }]
  },
  {
    name: 'ordresFabricacio',
    path: '/ordresFabricacio',
    component: lazyView('OrdresFabricacioView'),
    meta: {modul: 'OFS'}
  },
  {
    name: 'entrades',
    path: '/entrades',
    component: lazyView('EntradesView'),
    meta: {modul: 'ENTRADES'}
  },
  {
    name: 'EDI2',
    path: '/comandesEDI2',
    component: lazyView('EDI2View'),
    meta: {modul: 'COMANDES_EDI'}
  },
  {
    name: 'movimentsMagatzem',
    path: '/movimentsMagatzem',
    component: lazyView('MovimentsMagatzemView'),
  },
  {
    // TODO Permisos: afegir meta: {modul: 'CONSUMS'} quan es configuri el mòdul
    name: 'consums',
    path: '/consums',
    component: lazyView('ConsumsView'),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (to != from) {
      return savedPosition ||
        to.meta?.scrollPos ||
        { top: 0, left: 0 }
    }
    return;
  }
})


router.beforeEach((to, from, next) => {
  // Al tornarl del KeyCloak s'afegeixen uns paràmetres a la URL (no queda bé estèticament) i amb aquesta condició 
  // s'eliminen i aixì no apareixen a la URL
  if (to?.fullPath?.includes('state=') && to?.fullPath?.includes('session_state=') && to?.fullPath?.includes('code=')) {
    to.fullPath = to.path + to.hash?.substring(0, to.hash?.indexOf('state=')-1);
  }

  const permisosStore = usePermisosStore();
  const modul = to.meta?.modul;
  if (modul) {
    if (permisosStore.teModul(modul)) {
      return next();
    } else {
      next({ path: '/errorpermisos' });
    }
  } 

  // Posicionament de l'scroll
  from.meta?.scrollPos && (from.meta.scrollPos.top = window.scrollY);
  from.meta?.scrollPos && (from.meta.scrollPos.left = window.scrollX);
  return next()
})
export default router
