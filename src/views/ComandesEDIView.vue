<template>
  <AjudaClient :visible="visibleAjudaClients" @update:carregat="visibleAjudaClients = false"
    :seleccioCallback="callbackClientSeleccionat" />
  <div class="card">
    <h5 class="card-header">
      <font-awesome-icon icon="fa-solid fa-indent" style="font-size: 1.25rem" />
      {{ $t('ComandesEDI.titol') }}
      <!--TODO posar icones d'opcions del llistat de forma adecuada-->
      <Button :label="$t('ComandesEDI.linies.accions.importa')" icon="pi pi-file-excel" class="p-button-sm"
        style="margin-left: 15px;" disabled />
      <MultiSelect v-model="usuarisEDIFiltre" :options="usuarisEDI" optionLabel="nom" optionValue="id"
        :placeholder="$t('ComandesEDI.filtre.usuaris')" class="col-md-3" style="margin-left: 15px;width: 160px;"
        @update:modelValue="aplicaFiltreNou" />
    </h5>

    <ContextMenu ref="contextMenu" :model="menuModel" style="width: auto;" />
    <div id="divComandes">
      <DataTable v-model:expandedRows="expandedRows" :value="comandesEDI" class="p-datatable-sm" :dataKey="codi"
        style="margin-top: 15px;" :scrollable="true" scrollHeight="83vh" :resizableColumns="true"
        columnResizeMode="expand" contextMenu v-model:contextMenuSelection="registreSeleccionat"
        @rowContextmenu="showContextMenu($event)" showGridlines v-model:selection="registreSeleccionat"
        @row-dblclick="clickFormatPdfAmes(registreSeleccionat.codi)" selectionMode="single"
        :rowClass="() => 'estilRow'" @row-select="selectedIndex = $event.index; emit('updateFocus', true);"
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rowsPerPageOptions="[15, 30, 50]" :paginator="false" :rows="15">
        <template #empty>
          <div style="width:100%; height: 25vh; text-align: center; padding-top: 30px;">
            <InfoTaulaBuida :icon="'fa-solid fa-info'" :literal="$t('EDI.Cap comanda')" />
          </div>
        </template>
        <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
          <template #body="{ data }">
            <div style="width: 100%;">
              <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                @click="registreSeleccionat = data; contextMenu.show($event)" />
            </div>
          </template>
        </Column>
        <Column field="document" :header="$t('ComandesEDI.taula_comandesEDI.tipus')" :style="{ width: '80px' }"
          style="max-width: 80px;" :sortable="true">
          <template #body="{ data }">
            {{ data.document }}
          </template>
        </Column>
        <Column field="data" :header="$t('ComandesEDI.taula_comandesEDI.data')" :style="{ width: '140px' }"
          style="max-width: 140px;" :sortable="true">
          <template #body="{ data }">
            {{ $d(data.data, 'long') }}
          </template>
        </Column>
        <Column field="usuariLogistica" :header="$t('ComandesEDI.taula_comandesEDI.usuari')" :sortable="true"
          :style="{ width: '160px' }" style="max-width: 160px;">
          <template #body="{ data }">
            {{ data.usuariLogistica }}
          </template>
        </Column>
        <Column field="nomClientAmes" :header="$t('ComandesEDI.taula_comandesEDI.client')" :style="{ width: '600px' }"
          :sortable="true" style="max-width: 600px;">
          <template #body="{ data }">
            <!-- {{ data.clientFlags }} -->
            <div v-if="data.nomClientAmes !== null && data.nomClientAmes !== ''" class="ellipsis"
              v-tooltip="'EDI (' + (data.clientProfile?.tipedi ?? 'N/D') + ') - ' + data.nomClientAmes + ' ' + $t('ComandesEDI.taula_comandesEDI.article') + '=' + data.article">
              <span v-if="!data.status.startsWith('ERROR')">
                <a class="enllas text-overflow-ellipsis" @click="mostraLiniesDeComanda(data)">
                  {{ data.nomClientAmes }}
                </a>
              </span>
              <span v-else>{{ data.observacions }}</span>
            </div>
            <!-- Mostrar un ícono si nomClientAmes está vacío -->
            <span v-else>
              <i class="pi pi-exclamation-circle"/>&nbsp;{{ data.observacions }}
            </span>
          </template>
        </Column>
        <Column field="missatgeNumero" :header="$t('ComandesEDI.taula_comandesEDI.missatge')" :sortable="true"
          style="width: 220px;max-width: 220px">
          <template #body="{ data }">
            <div v-if="!data.status.startsWith('ERROR')" class="ellipsis"
              v-tooltip="data.missatgeNumero + ' ' + $t('ComandesEDI.taula_comandesEDI.article') + '=' + data.article">
              <i class="pi pi-copy ml-2 cursor-pointer" 
                @click.stop="copy2clipboard(data.missatgeNumero)" style="margin-right: 5px;"/>
              <a class="enllas" @click="mostraLiniesDeComanda(data)">
                {{ data.missatgeNumero }}
              </a>

              <!-- Ícono para copiar al portapapeles -->
              
            </div>
            <span v-else>{{ data.missatgeNumero }}</span>
          </template>
        </Column>
        <Column field="article" :header="$t('ComandesEDI.taula_comandesEDI.article')" :sortable="true"
          style="width: 220px;max-width: 220px">
          <template #body="{ data }">
            <span v-if="data.article==='M'" style="font-weight: bold;">
                {{ data.article }}
            </span>
            <span v-else>
              {{ data.article }}
            </span>
          </template>
        </Column>
        <!-- <Column field="clientProfile.tipedi" :header="$t('ComandesEDI.taula_comandesEDI.categoria')"
          :style="{ width: '50px' }" style="max-width: 50px;" bodyStyle="justify-content: center;" :sortable="true">
          <template #body="{ data }">
            <span v-if="data.clientProfile !== null && data.clientProfile !== ''">{{ data.clientProfile.tipedi }}</span>
            <span v-else>-</span>
          </template>
        </Column> -->
        <!-- <Column :header="$t('ComandesEDI.taula_comandesEDI.observacions')" :style="{ width: '380px' }"
          style="max-width: 380px;">
          <template #body="{ data }">
            <div v-tooltip="data.observacions">
              {{ data.observacions }}
            </div>
          </template>
        </Column> -->
        <!--Column :header="$t('ComandesEDI.taula_comandesEDI.observacions')" :style="{ width: '330px' }"
        style="max-width: 330px;">
        <template #body="{ data }">
          <Button label="Ver detalles" @click="showOverlay($event,data.observacions)" />
                <OverlayPanel para mostrar detalles>
                <OverlayPanel ref="overlayPanel">
                  <p>Nombre: {{ data.observacions }}</p>
                </OverlayPanel>
                {{ data.observacions }}
        </template>
      </Column-->
        <!-- <Column header="##dev_data##" :style="{ width: '400px' }" style="max-width: 400px;color:gray;">
          <template #body="{ data }">
            <span style="color:gray; font-size: xx-small;">
              {{
                data.codi
              }}
              <br><a :href="`http://localhost:3535/comercial/comandes/EDI/txt/${data.codi}`">{{
                data.pathEDI.split("\\").pop() }}</a>
              <Tag class="p-button-sm" value="Flags" style="background-color: red;border-color: red;"
                v-tooltip.top="JSON.stringify(data.clientProfile)" />
            </span>
          </template>
        </Column> -->
      </DataTable>
    </div>
  </div>
</template>

<script>
import EDIService from '@/services/edi.service';
import comandesService from "@/services/comandes.service";
import { useRouter, useRoute } from 'vue-router';
import AjudaClient from '@/views/modals/AjudaClient.vue';
import { carrega } from '@/services/loader';
import { onMounted, computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { scrollCenter } from '@/utils/datetableUtils.js';
import { saveAs } from 'file-saver';
import ediService from '@/services/edi.service';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from "primevue/usetoast";
import {copyText} from 'vue3-clipboard'; 

export default {
  name: 'ComandesEDIView',
  components: {
    AjudaClient
  },
  props: {
    visible: Boolean,
  },
  setup() {
    const { t } = useI18n();
    const titolResultats = ref('');
    const router = useRouter();
    const route = useRoute();
    const filtreUsuaris = ref([]);
    // const route = useRoute();
    const elementComandes = () => document.getElementById('divComandes');
    const comandesEDI = ref([]);
    const usuarisEDI = ref([]);
    const contextMenu = ref();
    const registreSeleccionat = ref();
    const selectedIndex = ref(-1);
    const liniesExpand = ref({});
    const expandedRows = ref(new Array());
    const confirm = useConfirm();
    const toast = useToast();
    const clientSel = ref();
    const visibleAjudaClients = ref(false);
    const usuarisEDIFiltre = ref([]);
    //const informacioComandaArtcli = ref();
    //const comanda = ref();
    // const state = reactive({
    //   dataInici: new Date(),
    //   articleclient: '',
    //   mostrarEliminades: false,
    // });

    const copy2clipboard = (txt) => {
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

    onMounted(async () => {

      console.log("LocalStorage:  " + localStorage.getItem('EDIfiltreUsuaris'));

      console.log("usuarisEDIFiltre:  " + localStorage.getItem('EDIfiltreUsuaris'));

      // comandesEDI.value = await carrega(EDIService.llistatComandesUsuari(filtreUsuaris));


      if (route.query.cargarDatos === "true") {
        console.log("onMounted//cargarDatos");

      }

      // usuarisEDIFiltre.value = JSON.parse(localStorage.getItem('EDIfiltreUsuaris'));

      // const data = await carrega(EDIService.llistatComandes());
      // //console.log("data-> " + data[12].pathPDF.split("\\").pop());
      // visibleAjudaClients.value = false;
      // // console.log("visibleAjudaClients.value: " + visibleAjudaClients.value);
      // comandesEDI.value = data;
      //console.log("this.registreSeleccionat: " + this.registreSeleccionat);


      // this.registreSeleccionat = comandesEDI.value.find(item => item.codi === this.selectedIndex.value) || null;
    });

    watch(selectedIndex, () => {
      if (selectedIndex.value >= 0) {
        // console.log("index seleccionat: " + selectedIndex.value);
        scrollCenter(elementComandes(), selectedIndex);
      }
    });

    // watch(filtreUsuaris, async () => {
    //   // console.log("filtreArticles: " + filtreArticles.value);
    //   comandesEDI.value = await carrega(EDIService.llistatComandesUsuari(filtreUsuaris.value));
    // });

    const aplicaFiltreNou = async (filtreUsuaris) => {
      console.log("filtreUsuaris: " + filtreUsuaris);
      const storedValue = localStorage.getItem('EDIfiltreUsuaris');

      if (storedValue === null || storedValue === '') {
        console.log('Hi ha filtre al localStorage: ');
        usuarisEDIFiltre.value = JSON.stringify(filtreUsuaris);
      }
      if (!filtreUsuaris || filtreUsuaris.length === 0) {
        console.log("aplicaFiltreNou1");
        comandesEDI.value = await carrega(EDIService.llistatComandes());
      }
      else {
        console.log("aplicaFiltreNou2: #" + filtreUsuaris + "#");
        comandesEDI.value = await carrega(EDIService.llistatComandesUsuari(filtreUsuaris));
      }
      localStorage.setItem('EDIfiltreUsuaris', JSON.stringify(filtreUsuaris));
    }

    const showNode = async (e) => {
      var index = expandedRows.value.indexOf(e);
      if (index !== -1) {
        expandedRows.value.splice(index, 1);
      } else {
        let clau = `${e.codi}_${e.numero}`;
        liniesExpand.value[clau] = await carrega(EDIService.queryTarifes());
        expandedRows.value.push(e);
      }
      registreSeleccionat.value = e;
    }

    const refresh = async () => {
      console.log("Refresh de comandesView: ");




      // comandesEDI.value = await carrega(EDIService.llistatComandes());
      // let localStorage.getItem('EDIfiltreUsuaris').value

      if (localStorage.getItem('EDIfiltreUsuaris') != '') {
        console.log("1tinc filtres al localStorage: " + localStorage.getItem('EDIfiltreUsuaris'));

        const filtreUsuaris_ = ref([]);

        const storedValue = localStorage.getItem('EDIfiltreUsuaris');
        filtreUsuaris_.value = storedValue ? JSON.parse(storedValue) : [];


        const nombresUnidos = computed(() => filtreUsuaris_.value.join(","));
        console.log("2tinc filtres al localStorage: " + nombresUnidos.value);
        usuarisEDI.value = await carrega(EDIService.opcionsUsuaris(localStorage.getItem('EDIfiltreUsuaris')))

        if (nombresUnidos.value === null || nombresUnidos.value === '') {
          console.log("refresh1");

          comandesEDI.value = await carrega(EDIService.llistatComandes());
        }
        else {
          console.log("refresh2");
          comandesEDI.value = await carrega(EDIService.llistatComandesUsuari(nombresUnidos.value));
        }
      }
      else {
        console.log("no tinc filtres al localStorage: " + localStorage.getItem('EDIfiltreUsuaris').value);
        usuarisEDI.value = await carrega(EDIService.opcionsUsuaris())
      }
      console.log("usuaris: " + usuarisEDI.value)
    }

    const clickFormatPdfAmes = async () => {
      let resp = await (carrega(ediService.descarregaFormatPdfAmes(registreSeleccionat.value.pathEDI)));
      saveAs(new Blob([resp]), nomFitxer.value);
    }

    const nomFitxer = computed(() => {
      if (registreSeleccionat.value && registreSeleccionat.value.pathPDF) {
        return registreSeleccionat.value.pathPDF.split("/").pop();
      }
      return registreSeleccionat.value.missatgeNumero + ".pdf"; // Valor por defecto si pathPDF no está definido
    });

    // const clickObteJSONComanda = async () => {
    //   console.log("Nom json: " + registreSeleccionat.value.pathEDI.split("/").pop().split(".")[0]+".json");
    //   let json = await (carrega(ediService.obteComandaJSON(registreSeleccionat.value.codi)));

    //   const sortedJson = {};
    //   const sortedKeys = Object.keys(json).sort(); // Ordena las claves alfabéticamente

    //   // Rellenar el objeto ordenado
    //   sortedKeys.forEach((key) => {
    //     sortedJson[key] = json[key];
    //   });  

    //   saveAs(new Blob([JSON.stringify(sortedJson)]), registreSeleccionat.value.pathEDI.split("\\").pop().split(".")[0]+".json");
    // }

    const clickBorraComanda = async () => {

      // console.log("clickBorraComanda//nom: " + registreSeleccionat.value.codi)
      confirm.require({
        header: t('App.Confirmacio'),
        acceptClass: 'p-button-danger',
        message: t('ComandesEDI.ConfirmaBorrar', [registreSeleccionat.value.message]),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          carrega(ediService.borraComanda(registreSeleccionat.value.codi)).then(() => {
            toast.add({ severity: 'success', summary: 'Eliminada', life: 3000 });
            refresh();
          })
        },
        reject: () => {
        }
      });
    }

    const mostraLiniesDeComanda = async (registre) => {
      registreSeleccionat.value = registre;
      router.push({ name: 'liniesEDI', params: { id: registre.codi } });
    }

    const contingutRetallat = (valor) => {
      if (!valor)
        return;
      return valor.substring(0, 10) + "...";
    }

    const menuModel = ref([]);


    const callbackClientSeleccionat = async (c) => {
      visibleAjudaClients.value = false;
      clientSel.value = await (carrega(comandesService.obtenirClient(c.codi)));
      // nextTick(() => {
      //   gridComandes.value.performSearch();
      // })
    }

    // TODO Ara no funciona, pero cal controlar que per cada registre mostri l'opcio de descarregar PDF nomes quan la propietat pathPDF esta informada. Es a dir, no "undefined"
    //if (registreSeleccionat.value?.pathPDF !== undefined) {
    // console.log("registreSeleccionat.value: " + registreSeleccionat.value)

    menuModel.value = [
      {
        label: () => `PDF`,
        class: 'p-button-text',
        icon: 'pi pi-download',
        command: () => clickFormatPdfAmes(registreSeleccionat.value.codi)
      },
      // {
      //   label: () => `${t('ComandesEDI.menuregistre.veure')}`,
      //   class: 'p-button-text',
      //   icon: 'pi pi-eye',
      //   command: () => clickObteJSONComanda(registreSeleccionat.value.codi)
      // },
      {
        label: () => `${t('ComandesEDI.menuregistre.esborrar')}`,
        class: 'p-button-text',
        icon: 'pi pi-trash',
        command: () => clickBorraComanda(registreSeleccionat.value.codi)
      },
    ];


    // const getButtonSeverity = (status) => {
    //   console.log("status: " + status);

    //         if (status === 'WARNING') {
    //             console.log("warning");
    //             return 'background-color: red;';
    //         } else if (status === 'DRAFT') {
    //             return 'success';
    //         } else if (status === 'ERROR') {
    //             return 'danger';
    //         } else {
    //             return 'info'; // Valor por defecto
    //         }
    //     };
    //  console.log("Si tenim PDF");
    //} else {
    //  menuModel.value = [];
    //  console.log("No tenim PDF");  // Opcional: si quieres vaciar el menú en caso de que la condición no se cumpla
    //}


    //    const modalVisible = () => {
    //      return visibleAjudaBuscadorComandes.value;
    //    }

    return {
      copy2clipboard,
      titolResultats,
      registreSeleccionat,
      comandesEDI,
      selectedIndex,
      filtreUsuaris,
      expandedRows,
      showNode,
      watch,
      router: useRouter(),
      mostraLiniesDeComanda,
      contextMenu,
      //showContextMenu,
      aplicaFiltreNou,
      menuModel,
      refresh,
      contingutRetallat,
      // state,
      clientSel,
      visibleAjudaClients,
      callbackClientSeleccionat,
      usuarisEDI,
      // getButtonSeverity
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.refresh();
    });
  }

}
</script>

<style scoped>
::v-deep(.p-panel-header) {
  padding: 0.5rem;
}

::v-deep(.estilRow) {
  cursor: pointer;
}

::v-deep(.estilRow .ocultable) {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: auto;
  margin-right: auto;
  display: none;
}

::v-deep(.estilRow:hover .ocultable) {
  display: flex;
}

::v-deep(.estilRow .buttoicon) {
  height: 1.5rem !important;
  width: 1.5rem !important;
  margin-left: auto;
  margin-right: auto;
}

.flex-container {
  padding: 5px 10px;
  display: flex;
  gap: 25px;
}

.label-detall {
  font-weight: 600;
  font-size: 1rem;
}
</style>