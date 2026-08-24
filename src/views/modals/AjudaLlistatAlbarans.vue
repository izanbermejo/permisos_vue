<template>
  <Dialog v-model:visible="visible" modal @hide="hide" :closable="true" :closeOnEscape="false" git :header="titol()" style="width: 980px">
    <!-- <div class="card" style="margin: 15px;">
      <span>
        <label class="label-detall" style="font-weight: bold;"> {{
          `${$t('ComandesEDI.linies.ultimsAlbarans.albararebut')}:` }}&nbsp;</label>{{ ultimAlbara }}
        <label class="label-detall" style="font-weight: bold;margin-left: 15px;">{{
          `${$t('ComandesEDI.linies.ultimsAlbarans.transit')}:` }}&nbsp;</label>{{ sumaQuantitatHastaAlbara }}
      </span>
    </div> -->
    <br />
    <span style="font-weight: bold;margin-right: 20px;">
      {{ `${$t('ModalAjudaLlitatAlabarans.EDI.titol')}` }}
    </span>
    <span style="margin-right: 10px;">
      {{ `${$t('ModalAjudaLlitatAlabarans.EDI.albara')}:` }}&nbsp;<i v-if="ultimAlbara" class="pi pi-copy ml-2 cursor-pointer" 
      @click.stop="copy2clipboard(ultimAlbara)" style="margin-right: 5px;margin-left: 5px;"></i>&nbsp;{{ ultimAlbara ? ultimAlbara : "-" }}
    </span>
    <span :style="{ color: coincideixAcumulats() ? '#495057' : 'red', display: 'contents' }">{{
      `${$t('ModalAjudaLlistatAlbarans.EDI.acumulat')}:` }}&nbsp;{{ $n(props.ediacumulat) }}
    </span>
    <br />
    <span style="font-weight: bold;">
      {{ `${$t('ModalAjudaLlitatAlabarans.acumulatsAMES.titol')}` }}
    </span>
    &nbsp;&nbsp;
    <span>
      {{ `${$t('ComandesEDI.linies.comanda.dataacumulat')}` }}: &nbsp;
      {{
        props.acumulatsdata && new Date(props.acumulatsdata.split('/').reverse().join('-')).getTime() !== new
          Date('1899-12-30').getTime()
          ? `${$d(new Date(props.acumulatsdata), 'short')}`
          : "-"
      }}
      {{ `${$t('ComandesEDI.linies.comanda.stockacumulat')}`
      }}:&nbsp;
      {{ Number(props.acumulatsestoc) ? $n(Number(props.acumulatsestoc)) : '-' }}
      {{ `${$t('ComandesEDI.linies.comanda.albaraacumulat')}`
      }}:&nbsp;
      {{ props.acumulatsalbara }}
    </span>
    <br />
    <span style="font-weight: bold;">
      {{ `${$t('ComandesEDI.linies.ultimsAlbarans.transit')}` }}</span><span>&nbsp;{{ typeof sumaQuantitatHastaAlbara
        === 'number' && !isNaN(sumaQuantitatHastaAlbara) ? $n(sumaQuantitatHastaAlbara) : '-' }}

    </span>
    <div class="card-body">
      <div id="divLinies" style="margin: 15px;">
        <DataTable v-model:expandedRows="expandedRows" :value="ultimsAlbarans" class="p-datatable-sm"
          :dataKey="codiNumeroFormat" style="margin-top: 15px;" :scrollable="true" scrollHeight="65vh"
          :resizableColumns="true" columnResizeMode="expand" contextMenu
          v-model:contextMenuSelection="registreSeleccionat" @rowContextmenu="showContextMenu($event)" showGridlines
          v-model:selection="registreSeleccionat" selectionMode="single" :rowClass="() => 'estilRow'"
          @row-select="selectedIndex = $event.index">
          <template #empty>
            <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
              <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('ComandesEDI.linies.ultimsAlbarans.capalbara')" />
            </div>
          </template>
          <Column :style="{ width: '40px'}"
            style="max-width: 40px;">
            <template #body="{ data }">
              <!-- <span v-if="albaraComparator(props.ultalbara,data.albaraFactura)" style="font-weight: bold;">{{ data.albaraFactura }}</span> -->
              <span v-if="(ultimAlbara != data.factura && ultimAlbara != data.albara)" style="display: block; text-align: center;">
                <a class="enllas"
                  @click="canviaUltimAlbara(data.albara)">
                  <i class="pi pi-sign-in" v-tooltip="$t('ComandesEDI.linies.ultimsAlbarans.assigna')" />
                  <!-- {{ $t('ComandesEDI.linies.ultimsAlbarans.assigna') }}  -->
                </a></span>

            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.albara')" :style="{ width: '100px' }"
            style="max-width: 100px;">
            <template #body="{ data }">
              <!-- <span v-if="albaraComparator(props.ultalbara,data.albaraFactura)" style="font-weight: bold;">{{ data.albaraFactura }}</span> -->
              <span v-if="(ultimAlbara == data.factura || ultimAlbara == data.albara)" style="font-weight: bold;">{{
                data.albara }}</span>
              <span v-else>{{ data.albara }}</span>

            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.factura')" :style="{ width: '200px' }"
            style="max-width: 200px;">
            <template #body="{ data }">
              <!-- <span v-if="albaraComparator(props.ultalbara,data.albaraFactura)" style="font-weight: bold;">{{ data.albaraFactura }}</span> -->
              {{ data.factura }}
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.data')" :style="{ width: '100px' }"
            style="max-width: 100px;">
            <template #body="{ data }">
              {{ $d(data.dataAlbaraFactura) }}
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.incoterm')" :style="{ width: '95px' }"
            style="max-width: 95px;">
            <template #body="{ data }">
              <span :style="{ color: data.mateixEnviamentDelClient ? '#495057' : 'green' }">{{ data.incoterm }}</span>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.transportista')" :style="{ width: '110px' }"
            style="max-width: 110px;">
            <template #body="{ data }">
              <span :style="{ color: data.mateixEnviamentDelClient ? '#495057' : 'green' }" v-tooltip="` ${$transportista(data.codiTransportista)}`">{{` ${$transportista(data.codiTransportista)}`}}</span>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.quantitat')" :style="{ width: '80px' }"
            style="max-width: 100px;">
            <template #body="{ data }">
              <div style="width: 100%; text-align: right;">
                {{ $n(data.quantitat) }}
              </div>
            </template>
          </Column>
          <!-- <Column v-if="(props.acumulatsdata != null || props.acumulatsalbara != null) && props.ediacumulat > 0" -->
          <Column v-if="(props.acumulatsdata != null || props.acumulatsalbara != null)"
            :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.acumulat')" :style="{ width: '80px' }">
            <!-- <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.acumulat')" :style="{ width: '100px' }" -->
            style="max-width: 100px;">
            <template #body="{ data }">
              <div style="width: 120px; text-align: right;"> {{ $n(data.acumulat) }}</div>
            </template>
          </Column>
          <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.servida')" :style="{ width: '70px' }"
            style="max-width: 70px;">
            <template #body="{ data }">
              <div style="width: 70px; text-align: center;"> {{ data.servida }}</div>
            </template>
          </Column>
          <!-- <Column :header="$t('ComandesEDI.linies.ultimsAlbarans.taula.acumulattotal')" :style="{ width: '100px' }"
          style="max-width: 100px;">
          <template #body="{ data }">
            <span v-if="props.ultalbar == data.albara" style="font-weight: bold;">{{ data.acumulatTotal }}</span>
            <span v-else> {{ data.acumulat }}</span>
          </template>
        </Column> -->
        </DataTable>
      </div>
    </div>
  </Dialog>
</template>

<script>
import EDIService from '@/services/edi.service'
import { carrega } from "@/services/loader";
import useVuelidate from "@vuelidate/core";
import { required } from '@vuelidate/validators';
import { ref, computed, onMounted, onUnmounted, reactive} from 'vue';
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import {copyText} from 'vue3-clipboard'; 

export default {
  name: "AjudaLlistatAlbarans",
  props: {
    codicomanda: String,
    codiarticle: String,
    codiclient: String,
    ediultalbara: String,
    ediacumulat: String,
    tipusClient: String,
    acumulatsdata: String,
    acumulatsestoc: String,
    acumulatsalbara: String,
    acumulatscoincideixen: Boolean,
  },
  setup(props, { emit }) {

    // const refUltAlbara = toRef(props, 'ultalbara');

    // console.log("####codicomanda: " + props.codicomanda);
    // console.log("####ultalbara: " + props.ultalbara);
    // console.log("####codiarticle: " + props.codiarticle);
    // console.log("####codiclient: " + props.codiclient);
    // console.log("####tipusClient: " + props.tipusClient);
    // console.log("####dataAcumulat: " + props.dataAcumulat);
    // console.log("####estocAcumulat: " + props.estocAcumulat);
    // console.log("####albaraAcumulat: " + props.albaraAcumulat);

    const { t, locale } = useI18n();
    const toast = useToast();
    const ultimsAlbarans = ref([]);
    const ultimAlbara = ref();
    // const toDate = inject('toDate');
    const visible = ref(true);
    // const inputDataSolicitada = ref();
    // var isDataUpdated = false;
    // var stateInicial;
    const acumulat = ref();
    const transit = ref();

    const state = reactive({
      dataClient: new Date(),
      dataAmes: new Date(),
      dataMagatzem: new Date(),
      quantitat: 0,
    });
    // const validDate = (value) => {
    //   if (value)
    //     return (value instanceof Date);
    //   return true;
    // }
    const rules = {
      dataClient: { required },
      dataAmes: { required },
      dataMagatzem: { required },
      quantitat: { required }

    }
    const v = useVuelidate(rules, state);

    function copy2clipboard(txt) {
      copyText(txt, undefined, (error, event) => {
          if (error) {
            console.log(error, event);
            toast.add({severity:'warn', summary: t('ComandesEDI.linies.error.noArticle.missatge'), life: 5000});
          } else {
            //console.log(event)
            toast.add({severity:'success', summary: t('Comandes.copiarportapapeles.copiat.detail'), life: 5000});
          }
        });
    }

    const handler = (ev) => {
      if (ev.key === 'Escape') {
        hide();
      }
    }

    const coincideixAcumulats = () => {
      console.log("coincideixAcumulat//props.acumulatscoincideixen", props.acumulatscoincideixen);

      return props.acumulatscoincideixen;
      //   console.log("coincideixAcumulat//props.ediAcumulat",props.ediacumulat);
      //   console.log("coincideixAcumulat//props.acumulatsdata",props.acumulatsdata);
      //   console.log("coincideixAcumulat//props.acumulatestoc",props.acumulatsestoc);
      //   console.log("coincideixAcumulat//props.acumulatsalbara",props.acumulatsalbara);
      //   console.log("coincideixAcumulat//ultimsAlbarans",ultimsAlbarans.value);


      //   if (props.ediultalbara==null || props.ediacumulat===0)
      //     return true;
      //   // if /
      //   if (!acumulatsConfigurats)
      //     return true;
      //   else {
      //     var acumulatdata=0;
      //     if (props.acumulatsdata!==null) {
      //       for (const albara of ultimsAlbarans.value) {
      //         if (albara.dataAlbaraFactura<props.acumulatsdata)
      //           break;
      //         else
      //           acumulatdata=albara.acumulat
      //       }  
      //     }

      //     console.log("coincideixAcumulat//ultimsAlbarans//acumulatdata" + acumulatdata);


      //     for (const albara of ultimsAlbarans.value) {
      //       if (props.acumulatsalbara!==null && props.ediultalbara===props.acumulatsalbara)
      //         console.log("coincideixAcumulat//ultimsAlbarans//albara//acumulat",albara.acumulat);
      //     }
      //   }


      //   // if (props.props.ediAcumulat!==undefined && props.ediAcumulat!=0 && )
      //   //   coincideixAcumulat=false;

      //   return false;
    }

    // const acumulatsConfigurats = () => {
    //   console.log("coincideixAcumulat//props.acumulatsdata",props.acumulatsdata);
    //   console.log("coincideixAcumulat//props.acumulatestoc",props.acumulatsestoc);
    //   console.log("coincideixAcumulat//props.acumulatsalbara",props.acumulatsalbara);

    //   if (props.acumulatsestoc!==null && (props.acumulatsdata!==null || props.acumulatsalbara!==null))
    //     return true;

    //   return false;
    // }

    onMounted(async () => {
      console.log("onMounted//props.acumulatscoincideixen", props.acumulatscoincideixen);

      document.addEventListener("keydown", handler);
      // console.log("@@@@@@@@@@@@@@@@@@@@@@@ultalbara",refUltAlbara.value);
      carregaModal(ultimAlbara.value)
      // carregaModal("nouvalor");
    });

    const carregaModal = (async (nouValor) => {

      console.log("carregaModal(nouvalor):", nouValor);
      console.log("carregaModal(props.ultalbara):", props.ediultalbara);

      ultimAlbara.value = nouValor ?? props.ediultalbara;
      console.log("Valor final de ultimAlbara:", ultimAlbara);

      console.log("nou valor: " + nouValor)
      console.log("OnMounted codiarticle: " + props.codiarticle + " / codiclient: " + props.codiclient + " / tipusClient: " + props.tipusClient);
      console.log("OnMounted dataAcumulat: " + props.acumulatsdata + " / estocAcumulat: " + props.acumulatsestoc + " / albaraAcumulat: " + props.acumulatsalbara);

      if (props.codiarticle == '' || props.codiclient == '') {
        ultimsAlbarans.value = [];
      }
      else {
        ultimsAlbarans.value = await carrega(EDIService.llistaUltimsAlbarans(props.codiarticle, props.codiclient, ultimAlbara.value, props.tipusClient))
      }

      // acumulat.value=1;

      acumulat.value = ultimsAlbarans.value.reduce((max, item) => {
        return item.transit > max.transit ? item : max;
      }, ultimsAlbarans.value[0]);

      console.log("acumulat: " + acumulat.value.acumulat);
      // transit.value = sumaQuantitatHastaAlbara();
      console.log("transit: " + transit.value);

      // console.log("€€€€€€€€€€€€€€€€refUltAlbara: " + refUltAlbara.value);


      // let index = 0
      // let albaraNoTrobat = true;

      // while (albaraNoTrobat && index < ultimsAlbarans.value.length) {
      //   if (props.ultalbara == ultimsAlbarans.value[index].albaraFactura)
      //     albaraNoTrobat = false;
      //   else
      //     index++;
      // }

      // if (albaraNoTrobat || index == ultimsAlbarans.value.length) {
      //   transit.value = ''
      //   console.log("No he trobat la factura/albrara poso el valor de transit a '" + transit.value + "'");

      // }

      // for (let index = 0; index < ultimsAlbarans.value.length; index++) {
      //   const element = ultimsAlbarans.value[index].albaraFactura;
      //   console.log("element-->albaraFactura: " + element);

      // }

      console.log("ultimsAlbarans" + JSON.stringify(ultimsAlbarans.value));

      // nextTick(() => {
      //   setTimeout(() => inputDataSolicitada.value.$el.firstChild.focus(), 200);
      // });
    });

    const sumaQuantitatHastaAlbara = computed(() => {
      console.log(">>AjudaLlistaAlbarans//sumaQuantitatHastaAlbara//ultimAlbara.value" + ultimAlbara.value)
      if (ultimAlbara.value === '')
        return '0';
      else {
        let suma = 0;
        for (const reg of ultimsAlbarans.value) {
          console.log("reg.factura: " + reg.factura);
          if (reg.albara === ultimAlbara.value || reg.factura === ultimAlbara.value) break; // Detiene la suma antes de este albarà
          suma += reg.quantitat;
        }
        return suma;
      }
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handler);
    });

    // const handler = (key) => {
    //   if (key.key === 'Escape')
    //     hide();
    // }

    const titol = () => {
      return `${t('ModalAjudaLlistatAlbarans.titol')}`
      // return `${t('ComandesEDI.linies.ultimsAlbarans.titol')}` + `(` + props.article + `)`
    }

    // watch(
    //   () => [state.setmana],
    //   () => {
    //     if (!isDataUpdated) {
    //       state.dataSolicitada = moment(state.dataSolicitada).day("Monday").week(state.setmana).toDate();
    //       state.dataPrevistaSortida = calculaDiaSortida(state.dataSolicitada, props.infoArticle.diesTransitClient, props.infoArticle.diesSortida);
    //     }
    //     isDataUpdated = false;
    //   }
    // )

    const canviaUltimAlbara = async (nouUltimAlbara) => {

      console.log("canviaUltimAlbara>>INICI " + nouUltimAlbara);

      // console.log("codiComanda" + props.codicomanda);
      // console.log("codiArticle" + props.codiarticle);
      // console.log("ultAlbara: " + nouUltimAlbara);

      await carrega(EDIService.canviaUltimAlbara(props.codicomanda, props.codiarticle, nouUltimAlbara));

      carregaModal(nouUltimAlbara);
      emit("update:recarregaTaula");
      // window.location.reload();
    };


    const hide = () => {
      emit("update:carregat", false);
    };

    return {
      copy2clipboard,
      locale,
      visible,
      props,
      // state,
      // stateInicial,
      v,
      coincideixAcumulats,
      // acumulatsConfigurats,
      ultimsAlbarans,
      ultimAlbara,
      canviaUltimAlbara,
      // inputDataSolicitada,
      // updateData,
      titol,
      // guarda,
      hide,
      acumulat,
      transit,
      sumaQuantitatHastaAlbara,
      // albaraComparator,
    };

  },
};
</script>

<style scoped>
.titolCapsalera {
  margin-left: 25px;
  border: 1px solid #ffffff;
  background-color: #ffffff;
  padding: 4px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.form {
  margin-top: 2px;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px 30px;
}

.element-form>label {
  display: block;
}

.element-form>small {
  display: block;
}

.break {
  flex-basis: 100%;
  height: 0;
}
</style>