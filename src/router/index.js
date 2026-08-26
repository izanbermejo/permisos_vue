import { createRouter, createWebHistory } from 'vue-router'
import { usePermisosStore } from '@/stores/permisos';

function lazyView(view) {
  return () => import(/* webpackChunkName: "lazy-view-[request]" */ `../views/${view}.vue`)
}

const routes = [
  {
    path: '/',
    redirect: '/aplicacions'
  },
  {
    path: '/errorpermisos',
    component: lazyView('ErrorPermisosView'),
  },
  {
    name: 'aplicacions',
    path: '/aplicacions',
    component: lazyView('AplicacionsView'),
    // meta: {modul: 'APLICACIONS'}
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
