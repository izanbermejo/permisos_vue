<template>
  <div class="cel-embalatge" v-tooltip.top="tooltip">{{ text }}</div>
</template>

<script>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Condicionament d'embalatge d'una peça en una sola cel·la, amb el format «A x B (total)».
 *
 * El significat dels dos factors depèn del tipus d'article, perquè Advantage reaprofita el mateix
 * camp ACLUCAI per a dos nivells d'embalatge diferents:
 *
 *  - No normalitzats: ACLUCAI són les peces per CAIXA i ACLUCAP les caixes per palet,
 *    o sigui que el total són les peces per palet. És el criteri del TestQEmb del legacy,
 *    replicat al backend a CalcularAvisosEmbalatge.
 *  - Normalitzats: ACLUCAI són les peces per BOSSA i BOSXCAI les bosses per caixa, o sigui
 *    que el total són les peces per caixa. Als normalitzats ACLUCAP sempre és zero perquè
 *    no se'ls controla el palet.
 *
 * Com que a la cel·la els números sols són ambigus, el tooltip sempre diu quin nivell és cadascun.
 */
export default {
  name: 'InfoEmbalatge',
  props: {
    /** Advantage ACLUCAI: peces per caixa (no normalitzats) o peces per bossa (normalitzats) */
    unitatsEmbalatge: { type: Number, default: 0 },
    /** Advantage BOSXCAI: bosses per caixa. Només s'informa als normalitzats */
    bossesCaixa: { type: Number, default: 0 },
    /** Advantage ACLUCAP: caixes per palet. Sempre zero als normalitzats */
    caixesPalet: { type: Number, default: 0 },
    /** Cert si l'article-client és normalitzat (clicod '000000') */
    isNormalitzat: { type: Boolean, default: false },
  },
  setup(props) {
    const { t, n } = useI18n();

    // Segon factor del condicionament: bosses per caixa als normalitzats, caixes per palet a la resta
    const segonFactor = computed(() => (props.isNormalitzat ? props.bossesCaixa : props.caixesPalet) || 0);
    const total = computed(() => (props.unitatsEmbalatge || 0) * segonFactor.value);

    const text = computed(() => {
      if (!props.unitatsEmbalatge) return '—';
      if (!segonFactor.value) return n(props.unitatsEmbalatge);
      return `${n(props.unitatsEmbalatge)} x ${n(segonFactor.value)} (${n(total.value)})`;
    });

    const tooltip = computed(() => {
      if (!props.unitatsEmbalatge) return t('Albarans.Sense embalatge definit');
      if (!segonFactor.value) {
        return props.isNormalitzat
          ? t('Albarans.Embalatge nomes bossa', [n(props.unitatsEmbalatge)])
          : t('Albarans.Embalatge nomes caixa', [n(props.unitatsEmbalatge)]);
      }
      const args = [n(props.unitatsEmbalatge), n(segonFactor.value), n(total.value)];
      return props.isNormalitzat
        ? t('Albarans.Embalatge normalitzat', args)
        : t('Albarans.Embalatge estandard', args);
    });

    return { text, tooltip };
  },
};
</script>

<style scoped>
.cel-embalatge {
  width: 100%;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
