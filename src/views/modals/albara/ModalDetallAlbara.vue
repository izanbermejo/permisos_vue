<template>
  <AjudaImprimirAlbara v-if="albaraImprimir" :albara="albaraImprimir" @update:carregat="albaraImprimir = null" />
  <CanviarAdresa v-if="visibleCanviarAdresa" :carregat="visibleCanviarAdresa" @update:carregat="visibleCanviarAdresa = $event"
    :adresa="adresaEdicio.adresa" :informacioEnviament="adresaEdicio.informacioEnviament"
    :mostrarEnviament="adresaEdicio.mostrarEnviament" :codiClient="adresaEdicio.codiClient"
    :titol="adresaEdicio.titol" :onGuardar="adresaEdicio.onGuardar" :callbackOk="refrescar" />
  <ModalAdjuntsAlbarans v-if="visibleModalAdjunts && albara" :carregat="visibleModalAdjunts"
    :potEditar="permisosStore.tePermis('COMANDES', 'WRITE')"
    @update:carregat="visibleModalAdjunts = $event" :albara="albara.id.codiFormat" 
    @update:numAdjunts="onNumAdjuntsCanviat"/>
  <ModalCanviarPendentFacturar v-if="liniaPendentFacturar" :linia="liniaPendentFacturar"
    @tancar="liniaPendentFacturar = null" @guardat="refrescar" />
  <!-- Alta manual d'una línia: buscador d'articles-client i, un cop escollit, quantitat i preu -->
  <AjudaArticleClientByClient :visible="visibleAjudaArticleClientByClient"
    @update:carregat="visibleAjudaArticleClientByClient = false"
    @switch="switchAjuda" :seleccioCallbackArtIntCliCod="onArticleClientSeleccionat" />
  <AjudaArticleClientByArticle :visible="visibleAjudaArticleClientByArticle"
    @update:carregat="visibleAjudaArticleClientByArticle = false"
    @switch="switchAjuda" :seleccioCallbackArtIntCliCod="onArticleClientSeleccionat" />
  <ModalQuantitatPreuLinia v-if="articleClientLiniaNova" :idAlbara="idAlbara" :articleClient="articleClientLiniaNova"
    @update:carregat="articleClientLiniaNova = null" @afegida="refrescar" />
  <ContextMenu ref="opcionsMenu" :model="opcionsMenuModel" style="width: auto;" />
  <Dialog :visible="visible" modal :closable="true" :closeOnEscape="!modalIntern" :draggable="false"
    @update:visible="onHide"
    :style="{ width: '80vw', maxHeight: '92vh' }">
    <template #header>
      <div class="detall-header" v-if="albara">
        <span class="detall-header-titol">
          <font-awesome-icon icon="fa-solid fa-file-lines" style="margin-right: 8px;" />
          {{ $t('Albarans.Albara') }} {{ albara.id.codiFormat }} · {{ $empresa(albara.id.empresa) }}
          <ButtonShortcut icon="fa-solid fa-ellipsis" :literal="$t('App.Opcions')" style="margin-left: 20px;"
            @click="opcionsMenu.show($event)" />
          <span v-badge.warning="props.numAdjunts" class="p-overlay-badge" style="margin-left: 20px;">
            <ButtonShortcut icon="fa-solid fa-paperclip" :literal="$t('Comandes.Veure adjunts')" @click="visibleModalAdjunts = true" />
          </span>
        </span>
        <span class="detall-header-tags">
          <Tag :value="albara.isTancat ? $t('Albarans.Tancat') : $t('Albarans.Obert')"
            :icon="albara.isTancat ? 'pi pi-lock' : 'pi pi-lock-open'"
            :style="{ backgroundColor: albara.isTancat ? '#8a8f96' : '#4a9e57' }" />
          <Tag :value="albara.isFacturat ? $t('Albarans.Facturat') : $t('Albarans.No facturat')"
            :icon="albara.isFacturat ? 'pi pi-check' : 'pi pi-clock'"
            :style="{ backgroundColor: albara.isFacturat ? '#00939b' : '#f0bd3c' }" />
          <!-- Autofacturable: només als albarans de client. El canvi es fa des del menú d'opcions -->
          <span v-if="albara.tipus === 'CLIENT'" class="tag-amb-accio">
            <Tag :value="albara.isFacturacioAutomatica ? $t('Albarans.Autofacturable') : $t('Albarans.No autofacturable')"
              :icon="albara.isFacturacioAutomatica ? 'pi pi-check' : 'pi pi-times'"
              :style="{ backgroundColor: albara.isFacturacioAutomatica ? '#4a9e57' : '#8a8f96' }" />
            <i v-if="detall.isFacturacioIniciada" class="pi pi-lock tag-blocat"
              v-tooltip="$t('Albarans.No es pot canviar autofacturable')" />
          </span>
          <Tag v-if="albara.isTraspas" :value="$t('Albarans.Traspas')" style="background-color:#6c6fd6" />
          <!-- Abonable: només als traspassos amb canvi d'empresa, que són els únics que es facturarien -->
          <Tag v-if="albara.isTraspasEmpresa"
            :value="albara.isTraspasAbonable ? $t('Albarans.Abonable') : $t('Albarans.Facturable')"
            :icon="albara.isTraspasAbonable ? 'pi pi-replay' : 'pi pi-euro'"
            :style="{ backgroundColor: albara.isTraspasAbonable ? '#b06fb0' : '#00939b' }" />
        </span>
      </div>
      <span v-else class="detall-header-titol">{{ $t('Albarans.Detall albara') }}</span>
    </template>

    <div v-if="albara" class="detall-cos">
      <!-- Fila superior: dades generals + adreça/enviament + estats -->
      <div class="detall-grid">
        <!-- Dades generals -->
        <div class="box">
          <div class="box-titol">{{ $t('Albarans.Dades generals') }}</div>
          <div class="box-cos camps">
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Client') }}</span>
              <span>{{ albara.client ? `${albara.client}${clientNom ? ' - ' + clientNom : ''}` : '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Data') }}</span>
              <span>{{ albara.data ? $d($toDate(albara.data), 'short') : '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Magaztem sortida') }}</span>
              <span>{{ albara.magatzem || '—' }}</span></div>
            <div class="camp" v-if="albara.isTraspas"><span class="camp-label">{{ $t('Albarans.Magaztem recepcio') }}</span>
              <span>{{ albara.magatzemTraspas || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Tipus') }}</span>
              <span>{{ albara.tipus || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Num proveidor') }}</span>
              <span>{{ albara.numeroProveidor || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Alb especial') }}</span>
              <span>{{ albara.numeroAlbaraEspecial || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Ref transport') }}</span>
              <span>{{ albara.referenciaTransport || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Creat per') }}</span>
              <span>{{ albara.usuariCreacio || '—' }}<template v-if="albara.dataCreacio"> ({{ $d($toDate(albara.dataCreacio), 'short') }})</template></span></div>
          </div>
        </div>

        <!-- Adreça i enviament -->
        <div class="box">
          <div class="box-titol box-titol-flex">
            <span>{{ $t('Albarans.Adreca enviament') }}</span>
            <Button v-if="albara && !albara.isTancat" icon="pi pi-pencil" class="p-button-text p-button-sm btn-edit"
              v-tooltip="$t('Albarans.Editar adreca')" @click="editarAdresaPrincipal" />
          </div>
          <div class="box-cos camps">
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Destinatari') }}</span>
              <span>{{ albara.adresa?.destinatari || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Adreca') }}</span>
              <span>{{ albara.adresa?.adresa || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Poblacio') }}</span>
              <span>{{ [albara.adresa?.codiPostal, albara.adresa?.poblacio].filter(Boolean).join(' ') || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Pais') }}</span>
              <span>{{ albara.adresa?.pais || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Transportista') }}</span>
              <span>{{ albara.informacioEnviament?.transportista || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Forma enviament') }}</span>
              <span>{{ albara.informacioEnviament?.formaEnviament || '—' }}</span></div>
            <div class="camp"><span class="camp-label">{{ $t('Albarans.Incoterm') }}</span>
              <span>{{ albara.informacioEnviament?.incoterm || '—' }}</span></div>
          </div>
        </div>

        <!-- Estats magatzem -->
        <div class="box">
          <div class="box-titol">{{ $t('Albarans.Estats') }}</div>
          <div class="box-cos">
            <div class="estat-flags">
              <span class="estat-flag" :class="{ actiu: mag.isEnPreparacio }">
                <i :class="mag.isEnPreparacio ? 'pi pi-check-circle' : 'pi pi-circle'" /> {{ $t('Albarans.En preparacio') }}</span>
              <span class="estat-flag" :class="{ actiu: mag.isEnServei }">
                <i :class="mag.isEnServei ? 'pi pi-check-circle' : 'pi pi-circle'" /> {{ $t('Albarans.En servei') }}</span>
              <span class="estat-flag" :class="{ actiu: mag.isServit }">
                <i :class="mag.isServit ? 'pi pi-check-circle' : 'pi pi-circle'" /> {{ $t('Albarans.Servit') }}</span>
              <span class="estat-flag" :class="{ actiu: mag.isEntregat }">
                <i :class="mag.isEntregat ? 'pi pi-check-circle' : 'pi pi-circle'" /> {{ $t('Albarans.Entregat') }}</span>
            </div>
            <div class="camps" style="margin-top: 8px;">
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Pes brut') }}</span>
                <span>{{ mag.pesBrut != null ? $n(mag.pesBrut) : '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Bultos') }}</span>
                <span>{{ mag.bultos != null ? $n(mag.bultos) : '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Data prevista') }}</span>
                <span>{{ mag.dataPrevista ? $d($toDate(mag.dataPrevista), 'short') : '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Data enviament') }}</span>
                <span>{{ mag.dataEnviament ? $d($toDate(mag.dataEnviament), 'short') : '—' }}</span></div>
            </div>
          </div>
        </div>
        <!-- Adreça bróker -->
        <div class="box" v-if="!albara.isTraspas">
          <div class="box-titol box-titol-flex">
            <span>{{ $t('Albarans.Adreca broker') }}</span>
            <Button v-if="!albara.isTancat" icon="pi pi-pencil" class="p-button-text p-button-sm btn-edit"
              v-tooltip="$t('Albarans.Editar adreca')" @click="editarAdresaBroker" />
          </div>
          <div class="box-cos camps">
            <template v-if="albara.adresaBroker">
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Destinatari') }}</span>
                <span>{{ albara.adresaBroker.destinatari || '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Adreca') }}</span>
                <span>{{ albara.adresaBroker.adresa || '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Poblacio') }}</span>
                <span>{{ [albara.adresaBroker.codiPostal, albara.adresaBroker.poblacio].filter(Boolean).join(' ') || '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Pais') }}</span>
                <span>{{ albara.adresaBroker.pais || '—' }}</span></div>
            </template>
            <span v-else class="sense-adresa">{{ $t('Albarans.Sense adreca') }}</span>
          </div>
        </div>

        <!-- Adreça factura proforma -->
        <div class="box" v-if="!albara.isTraspas">
          <div class="box-titol box-titol-flex">
            <span>{{ $t('Albarans.Adreca proforma') }}</span>
            <Button v-if="!albara.isTancat" icon="pi pi-pencil" class="p-button-text p-button-sm btn-edit"
              v-tooltip="$t('Albarans.Editar adreca')" @click="editarAdresaProforma" />
          </div>
          <div class="box-cos camps">
            <template v-if="albara.adresaFacturaProforma">
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Destinatari') }}</span>
                <span>{{ albara.adresaFacturaProforma.destinatari || '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Adreca') }}</span>
                <span>{{ albara.adresaFacturaProforma.adresa || '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Poblacio') }}</span>
                <span>{{ [albara.adresaFacturaProforma.codiPostal, albara.adresaFacturaProforma.poblacio].filter(Boolean).join(' ') || '—' }}</span></div>
              <div class="camp"><span class="camp-label">{{ $t('Albarans.Pais') }}</span>
                <span>{{ albara.adresaFacturaProforma.pais || '—' }}</span></div>
            </template>
            <span v-else class="sense-adresa">{{ $t('Albarans.Sense adreca') }}</span>
          </div>
        </div>
      </div>

      <!-- Observacions -->
      <div class="box" v-if="teObservacions">
        <div class="box-titol">{{ $t('Albarans.Observacions') }}</div>
        <div class="box-cos camps">
          <div class="camp camp-ample" v-if="albara.observacionsImpressio">
            <span class="camp-label">{{ $t('Albarans.Obs impressio') }}</span><span>{{ albara.observacionsImpressio }}</span></div>
          <div class="camp camp-ample" v-if="albara.observacionsInternes">
            <span class="camp-label">{{ $t('Albarans.Obs internes') }}</span><span>{{ albara.observacionsInternes }}</span></div>
          <div class="camp camp-ample" v-if="albara.incidenciaTransport">
            <span class="camp-label">{{ $t('Albarans.Incidencia transport') }}</span><span>{{ albara.incidenciaTransport }}</span></div>
        </div>
      </div>

      <!-- Línies -->
      <div class="box">
        <div class="box-titol box-titol-linies">
          <span>{{ $t('Albarans.Linies') }} ({{ linies.length }})</span>
          <ButtonShortcut v-if="potAfegirLinia" icon="fa-solid fa-plus" :literal="$t('Albarans.Afegir linia')"
            shortcut="[+]" @click="obrirAjudaArticleClient" />
        </div>
        <ContextMenu ref="liniaContextMenu" :model="liniaMenuModel" />
        <DataTable :value="linies" class="p-datatable-sm-petita" showGridlines dataKey="_key"
          scrollable scrollDirection="both" scrollHeight="34vh"
          :resizableColumns="true" columnResizeMode="expand"
          v-model:selection="selectedLinia" selectionMode="single"
          contextMenu v-model:contextMenuSelection="selectedLinia" @rowContextmenu="onLiniaContextMenu"
          :rowClass="() => 'estilRow'">
          <Column :style="{ width: '35px' }" style="max-width: 35px;" :reorderableColumn="false">
            <template #body="{ data }">
              <div style="width: 100%;">
                <Button icon="pi pi-ellipsis-h" class="p-button-rounded ocultable"
                  @click="selectedLinia = data; liniaContextMenu.show($event)" />
              </div>
            </template>
          </Column>
          <Column :header="$t('Albarans.Linia')" :style="{ width:'45px', maxWidth:'45px' }">
            <template #body="{ data }"><div class="ellipsis" v-tooltip="data.id?.liniaFormat">{{ data.id?.liniaFormat }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Referencia')" :style="{ width:'75px', maxWidth:'75px' }">
            <template #body="{ data }"><div class="ellipsis" v-tooltip="data.informacioPesa?.matriu">{{ data.informacioPesa?.matriu }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Article')" :style="{ width:'175px', maxWidth:'175px' }">
            <template #body="{ data }"><div class="ellipsis" v-tooltip="data.informacioPesa?.referencia">{{ data.informacioPesa?.referencia }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Quantitat')" :style="{ width:'100px', maxWidth:'100px' }">
            <template #body="{ data }"><div class="cel-num" v-tooltip="$n(data.quantitat)">{{ $n(data.quantitat) }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Pdt facturar')" :style="{ width:'120px', maxWidth:'120px' }">
            <template #body="{ data }"><div class="cel-num" v-tooltip="$n(data.quantitatPendentFacturar)">{{ $n(data.quantitatPendentFacturar) }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Pes unitari')" :style="{ width:'100px', maxWidth:'100px' }">
            <template #body="{ data }"><div class="cel-num">{{ data.informacioPesa?.pesUnitari ? $n(data.informacioPesa.pesUnitari) : '' }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Pes total')" :style="{ width:'100px', maxWidth:'100px' }">
            <template #body="{ data }"><div class="cel-num">{{ data.informacioPesa?.pesUnitari ? $n(data.pesTotal, 'decimal') : '' }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Embalatge')" :style="{ width:'140px', maxWidth:'140px' }">
            <template #body="{ data }">
              <InfoEmbalatge :unitatsEmbalatge="data.informacioPesa?.unitatsEmbalatge" :bossesCaixa="data.informacioPesa?.bossesCaixa"
                :caixesPalet="data.informacioPesa?.caixesPalet" :isNormalitzat="data.articleClient?.isNormalitzat" />
            </template>
          </Column>
          <Column :header="$t('Albarans.Nivell tecnic')" :style="{ width:'120px', maxWidth:'120px' }">
            <template #body="{ data }"><div class="ellipsis" v-tooltip="data.informacioPesa?.nivellTecnic">{{ data.informacioPesa?.nivellTecnic }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Denominacio')" :style="{ width:'120px', maxWidth:'120px' }">
            <template #body="{ data }"><div class="ellipsis" v-tooltip="data.informacioPesa?.denominacio">{{ data.informacioPesa?.denominacio }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Comanda')" :style="{ width:'100px', maxWidth:'100px' }">
            <template #body="{ data }"><div class="ellipsis" v-tooltip="String(data.infoComanda?.comanda ?? '')">{{ data.infoComanda?.comanda ?? '' }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Comanda client')" :style="{ width:'130px', maxWidth:'130px' }">
            <template #body="{ data }"><div class="ellipsis" v-tooltip="data.infoComanda?.comandaClient ?? ''">{{ data.infoComanda?.comandaClient ?? '' }}</div></template>
          </Column>
          <Column :header="$t('Albarans.Preu')" :style="{ width:'90px', maxWidth:'90px' }">
            <template #body="{ data }"><div class="cel-num" v-tooltip="data.preu ? `${$n(data.preu.valor, 'decimalLong')} ${data.preu.divisa}` : ''">{{ data.preu ? $n(data.preu.valor, 'decimalLong') : '' }}</div></template>
          </Column>
          <Column header="" :style="{ width:'55px', maxWidth:'55px' }">
            <template #body="{ data }"><div class="cel-divisa" v-tooltip="data.preu?.divisa">{{ data.preu?.divisa }}</div></template>
          </Column>
          <!-- Import sempre net. Es destaca i s'explica al tooltip només quan hi ha descompte,
               perquè altrament el net i el brut són el mateix i no hi ha res a aclarir. -->
          <Column :header="$t('Albarans.Import')" :style="{ width:'120px', maxWidth:'120px' }">
            <template #body="{ data }">
              <div class="cel-num" :class="{ 'import-amb-dte': data.descompte > 0 }" v-tooltip="hintImport(data)">
                {{ $n(data.importNet, 'decimal') }} {{ data.divisaImport }}
              </div>
            </template>
          </Column>
          <!-- Un albarà acabat de crear manualment encara no té cap línia -->
          <template #empty><div class="sense-linies">{{ $t('Albarans.Sense linies') }}</div></template>
        </DataTable>
        <!-- Totals de l'albarà (calculats al backend a partir de les línies).
             El brut i el descompte només es mostren quan hi ha descompte: als albarans sense
             descompte el brut i el net són el mateix i n'hi ha prou amb un únic import. -->
        <div class="totals" v-if="totals && linies.length">
          <span class="total">
            <span class="total-label">{{ $t('Albarans.Pes net') }}</span>
            <span class="total-valor">{{ $n(totals.pesNet, 'decimal') }}</span>
          </span>
          <template v-if="teDescompte">
            <span class="total">
              <span class="total-label">{{ $t('Albarans.Import brut') }}</span>
              <span class="total-valor">{{ $n(totals.importBrut, 'decimal') }} {{ totals.divisa }}</span>
            </span>
            <span class="total">
              <span class="total-label">{{ $t('Albarans.Descompte') }}</span>
              <span class="total-valor">-{{ $n(totals.importDescompte, 'decimal') }} {{ totals.divisa }}</span>
            </span>
            <span class="total total-destacat">
              <span class="total-label">{{ $t('Albarans.Import net') }}</span>
              <span class="total-valor">{{ $n(totals.importNet, 'decimal') }} {{ totals.divisa }}</span>
            </span>
          </template>
          <span v-else class="total total-destacat">
            <span class="total-label">{{ $t('Albarans.Import') }}</span>
            <span class="total-valor">{{ $n(totals.importNet, 'decimal') }} {{ totals.divisa }}</span>
          </span>
        </div>
      </div>
    </div>

    <div v-else style="padding: 30px; text-align: center;">{{ $t('App.Sense resultats') }}</div>

    <template #footer>
      <div class="detall-footer">
        <div class="detall-footer-esquerra">
          <Button :label="$t('Albarans.Imprimir albara')" icon="pi pi-file-pdf"
            class="p-button-sm" :disabled="!albara" @click="onImprimir" />
          <Button v-if="albara && !albara.isTancat" :label="$t('Albarans.Tancar albara')" icon="pi pi-lock"
            class="p-button-sm p-button-help" @click="onTancar" />
          <Button v-if="albara && albara.isTancat" :label="$t('Albarans.Reobrir albara')" icon="pi pi-lock-open"
            class="p-button-sm p-button-help" @click="onReobrir" />
          <Button v-if="albara" :label="$t('Albarans.Eliminar albara')" icon="pi pi-trash"
            class="p-button-sm p-button-danger" @click="onEliminar" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script>
import { ref, computed, watch, onUnmounted, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { carrega } from '@/services/loader';
import AlbaraService from '@/services/albara.service';
import ComandesService from '@/services/comandes.service';
import AjudaImprimirAlbara from './AjudaImprimirAlbara.vue';
import CanviarAdresa from '@/views/modals/canviaradresa/CanviarAdresa.vue';
import Swal from 'sweetalert2';
import ModalAdjuntsAlbarans from '@/views/modals/ModalAdjuntsAlbarans.vue';
import ModalCanviarPendentFacturar from './ModalCanviarPendentFacturar.vue';
import ModalQuantitatPreuLinia from './ModalQuantitatPreuLinia.vue';
import ButtonShortcut from '@/components/ButtonShortcut.vue';
import InfoEmbalatge from '@/components/InfoEmbalatge.vue';
import { usePermisosStore } from '@/stores/permisos';

// Càrrega asíncrona per trencar el cicle d'imports
// ModalDetallAlbara → AjudaArticleClientByArticle → ModalHistoricMoviments → HistoricMoviments → ModalDetallAlbara.
// Amb import estàtic, un dels registres del cicle captura `undefined` i el buscador no es renderitza.
const AjudaArticleClientByClient = defineAsyncComponent(() => import('@/views/modals/AjudaArticleClientByClient.vue'));
const AjudaArticleClientByArticle = defineAsyncComponent(() => import('@/views/modals/AjudaArticleClientByArticle.vue'));

export default {
  name: 'ModalDetallAlbara',
  components: { AjudaImprimirAlbara, CanviarAdresa, ModalAdjuntsAlbarans, ModalCanviarPendentFacturar,
    ModalQuantitatPreuLinia, AjudaArticleClientByClient, AjudaArticleClientByArticle, ButtonShortcut,
    InfoEmbalatge },
  props: {
    visible: { type: Boolean, default: false },
    idAlbara: { type: Object, default: null },
    numAdjunts: { type: Number, default: 0 }
  },
  emits: ['update:visible', 'canviat', 'update:numAdjunts'],  setup(props, { emit }) {
    const { t, n } = useI18n();
    const detall = ref(null);
    const clientNom = ref('');
    const selectedLinia = ref(null);
    const liniaContextMenu = ref(null);
    const opcionsMenu = ref(null);
    const albaraImprimir = ref(null);
    const visibleCanviarAdresa = ref(false);
    const adresaEdicio = ref({});
    const visibleModalAdjunts = ref(false);
    const liniaPendentFacturar = ref(null);
    const permisosStore = usePermisosStore();
    // Alta manual d'una línia: buscador d'articles-client (per client o per article) i peça escollida
    const visibleAjudaArticleClientByClient = ref(false);
    const visibleAjudaArticleClientByArticle = ref(false);
    const ultimaAjudaVisibleByClient = ref(true);
    const articleClientLiniaNova = ref(null);

    const albara = computed(() => detall.value?.albara ?? null);
    const linies = computed(() => (detall.value?.linies ?? []).map((l, i) => ({ ...l, _key: `l-${i}` })));
    const mag = computed(() => albara.value?.informacioMagatzem ?? {});
    // Totals (pes net i imports) calculats al backend a ObtenirDetallAlbara
    const totals = computed(() => detall.value?.totals ?? null);
    // Els albarans de traspàs i de consum, i els clients sense dto de normalitzats, no tenen descompte:
    // en aquests casos el brut i el net coincideixen i només es mostra un import
    const teDescompte = computed(() => Number(totals.value?.importDescompte ?? 0) !== 0);
    // Desglossa d'on surt l'import net de la línia. Retorna null quan no hi ha descompte: així
    // PrimeVue no arriba a mostrar cap tooltip en les línies on el net i el brut coincideixen.
    const hintImport = (linia) => {
      if (!(linia?.descompte > 0)) return null;
      return `${n(linia.importBrut, 'decimal')} − ${n(linia.descompte)}% = ${n(linia.importNet, 'decimal')} ${linia.divisaImport ?? ''}`.trim();
    };
    const teObservacions = computed(() => !!(albara.value?.observacionsImpressio || albara.value?.observacionsInternes || albara.value?.incidenciaTransport));

    // Cert mentre hi ha algun modal per damunt del detall: aleshores Esc l'ha de tancar a ell, no el detall
    const modalIntern = computed(() =>
      visibleCanviarAdresa.value || !!albaraImprimir.value || visibleModalAdjunts.value
      || !!liniaPendentFacturar.value || visibleAjudaArticleClientByClient.value
      || visibleAjudaArticleClientByArticle.value || !!articleClientLiniaNova.value);

    // Alta manual de línies: només als albarans de traspàs oberts i mentre encara siguin modificables.
    // El backend torna a validar-ho tot; aquí només s'amaga l'acció quan segur que no es pot fer.
    const potAfegirLinia = computed(() =>
      !!albara.value && albara.value.isTraspas && !albara.value.isTancat && !albara.value.isFacturat
      && permisosStore.tePermis('COMANDES', 'WRITE'));

    const carregarDetall = async () => {
      detall.value = null;
      clientNom.value = '';
      if (!props.idAlbara) return;
      const resp = await carrega(AlbaraService.obtenirDetallAlbara(props.idAlbara));
      detall.value = resp?.data ?? resp ?? null;
      // Nom del client (no ve dins l'albarà)
      const clicod = detall.value?.albara?.client;
      if (clicod) {
        try {
          const c = await ComandesService.obtenirClient(clicod, false);
          clientNom.value = (c?.data ?? c)?.nom ?? '';
        } catch { clientNom.value = ''; }
      }
    };

    watch(() => props.visible, (obert) => {
      if (obert) {
        carregarDetall();
        document.addEventListener('keydown', keyHandler);
      } else {
        detall.value = null;
        document.removeEventListener('keydown', keyHandler);
      }
    });

    onUnmounted(() => document.removeEventListener('keydown', keyHandler));

    /**
     * La tecla + obre l'alta de línia. No s'hi reacciona si hi ha cap modal per damunt del detall ni
     * si l'usuari està escrivint, perquè el + és un caràcter normal dins d'un camp de text.
     */
    const keyHandler = (ev) => {
      if (ev.key !== '+') return;
      if (!props.visible || modalIntern.value || !potAfegirLinia.value) return;
      const actiu = document.activeElement;
      if (actiu && (actiu.tagName === 'INPUT' || actiu.tagName === 'TEXTAREA' || actiu.isContentEditable)) return;
      ev.preventDefault();
      obrirAjudaArticleClient();
    };

    // En tancar el detall, un albarà sense línies només pot venir d'una alta manual que s'ha deixat a
    // mitges: es proposa eliminar-lo per no deixar capçaleres buides (amb el número d'albarà consumit).
    const onHide = async (val) => {
      if (val) return;
      if (albara.value && linies.value.length === 0) {
        const res = await Swal.fire({
          icon: 'question', title: t('Albarans.Albara sense linies'),
          text: t('Albarans.Confirmar eliminar albara buit'),
          showCancelButton: true, reverseButtons: true,
          confirmButtonText: t('Albarans.Eliminar albara'), cancelButtonText: t('Albarans.Mantenir albara'),
        });
        if (res.isConfirmed) {
          await carrega(AlbaraService.eliminarAlbara(props.idAlbara));
          emit('canviat', props.idAlbara);
        }
      }
      emit('update:visible', false);
    };
    const onImprimir = () => { if (albara.value) albaraImprimir.value = albara.value; };

    // Refresca el detall després d'una acció i notifica el pare perquè actualitzi el buscador
    const refrescar = async () => {
      await carregarDetall();
      emit('canviat', props.idAlbara);
    };

    const editarAdresaPrincipal = () => {
      adresaEdicio.value = {
        adresa: albara.value.adresa ?? {},
        informacioEnviament: albara.value.informacioEnviament ?? {},
        mostrarEnviament: true,
        codiClient: albara.value.client ?? null,
        titol: 'Albarans.Canviar adresa',
        onGuardar: (state) => AlbaraService.canviarAdresaAlbara(props.idAlbara, state),
      };
      visibleCanviarAdresa.value = true;
    };

    const editarAdresaBroker = () => {
      adresaEdicio.value = {
        adresa: albara.value.adresaBroker ?? {},
        informacioEnviament: null,
        mostrarEnviament: false,
        codiClient: null,
        titol: 'Albarans.Canviar adresa broker',
        onGuardar: (state) => AlbaraService.canviarAdresaBrokerAlbara(props.idAlbara, state),
      };
      visibleCanviarAdresa.value = true;
    };

    const editarAdresaProforma = () => {
      adresaEdicio.value = {
        adresa: albara.value.adresaFacturaProforma ?? {},
        informacioEnviament: null,
        mostrarEnviament: false,
        codiClient: null,
        titol: 'Albarans.Canviar adresa proforma',
        onGuardar: (state) => AlbaraService.canviarAdresaProformaAlbara(props.idAlbara, state),
      };
      visibleCanviarAdresa.value = true;
    };

    const onTancar = async () => {
      const res = await Swal.fire({
        icon: 'question', title: t('Albarans.Tancar albara'),
        text: t('Albarans.Confirmar tancar albara'),
        showCancelButton: true, reverseButtons: true, confirmButtonText: t('App.Confirmar'), cancelButtonText: t('App.Cancela'),
      });
      if (!res.isConfirmed) return;
      await carrega(AlbaraService.tancarAlbara(props.idAlbara));
      await refrescar();
    };

    const onReobrir = async () => {
      const res = await Swal.fire({
        icon: 'question', title: t('Albarans.Reobrir albara'),
        text: t('Albarans.Confirmar reobrir albara'),
        showCancelButton: true, reverseButtons: true, confirmButtonText: t('App.Confirmar'), cancelButtonText: t('App.Cancela'),
      });
      if (!res.isConfirmed) return;
      await carrega(AlbaraService.reobrirAlbara(props.idAlbara));
      await refrescar();
    };

    const onEliminar = async () => {
      const res = await Swal.fire({
        icon: 'warning', title: t('Albarans.Eliminar albara'),
        text: t('Albarans.Confirmar eliminar albara'),
        showCancelButton: true, reverseButtons: true, confirmButtonText: t('Albarans.Eliminar albara'), cancelButtonText: t('App.Cancela'),
        confirmButtonColor: '#d33',
      });
      if (!res.isConfirmed) return;
      await carrega(AlbaraService.eliminarAlbara(props.idAlbara));
      emit('canviat', props.idAlbara);
      emit('update:visible', false);
    };

    // Inverteix el flag d'autofacturable. El backend torna a validar que es pugui canviar.
    const onCanviarAutofacturable = async () => {
      await carrega(AlbaraService.canviarFacturacioAutomatica(props.idAlbara, !albara.value.isFacturacioAutomatica));
      await refrescar();
    };

    // Inverteix el flag d'abonable. Com que arrossega el pendent de facturar de totes les línies i els
    // pendents d'abonar, es demana confirmació explicant-ho. El backend torna a validar-ho tot.
    const onCanviarTraspasAbonable = async () => {
      const passaAAbonable = !albara.value.isTraspasAbonable;
      const res = await Swal.fire({
        icon: 'question',
        title: passaAAbonable ? t('Albarans.Marcar abonable') : t('Albarans.Treure abonable'),
        text: passaAAbonable
          ? t('Albarans.Confirmar marcar abonable', [linies.value.length])
          : t('Albarans.Confirmar treure abonable', [linies.value.length]),
        showCancelButton: true, reverseButtons: true,
        confirmButtonText: t('App.Confirmar'), cancelButtonText: t('App.Cancela'),
      });
      if (!res.isConfirmed) return;
      await carrega(AlbaraService.canviarTraspasAbonable(props.idAlbara, passaAAbonable));
      await refrescar();
    };

    // Menú d'opcions de la capçalera. Segueix el mateix model que el menú contextual del buscador.
    const opcionsMenuModel = computed(() => [
      { label: () => t('Albarans.Imprimir albara'), icon: 'pi pi-file-pdf', command: onImprimir },
      { label: () => t('Comandes.Veure adjunts'), icon: 'pi pi-paperclip', command: () => { visibleModalAdjunts.value = true; } },
      { separator: true },
      {
        label: () => t('Albarans.Tancar albara'), icon: 'pi pi-lock',
        visible: () => !!albara.value && !albara.value.isTancat,
        command: onTancar,
      },
      {
        label: () => t('Albarans.Reobrir albara'), icon: 'pi pi-lock-open',
        visible: () => !!albara.value?.isTancat,
        command: onReobrir,
      },
      {
        // Només als albarans de client: els de traspàs i els de consum no s'autofacturen mai.
        // Un cop s'ha començat a facturar l'albarà el flag ja no es pot canviar.
        label: () => albara.value?.isFacturacioAutomatica
          ? t('Albarans.Treure autofacturable')
          : t('Albarans.Marcar autofacturable'),
        icon: 'pi pi-euro',
        visible: () => albara.value?.tipus === 'CLIENT' && permisosStore.tePermis('COMANDES', 'WRITE'),
        disabled: () => !!detall.value?.isFacturacioIniciada,
        command: onCanviarAutofacturable,
      },
      {
        // Només als traspassos amb canvi d'empresa: a la resta no hi ha res a facturar ni a abonar.
        // Un cop la facturació hi ha entrat el flag ja no es pot canviar.
        label: () => albara.value?.isTraspasAbonable
          ? t('Albarans.Treure abonable')
          : t('Albarans.Marcar abonable'),
        icon: 'pi pi-replay',
        visible: () => !!albara.value?.isTraspasEmpresa && permisosStore.tePermis('COMANDES', 'WRITE'),
        command: onCanviarTraspasAbonable,
      },
      { separator: true },
      { label: () => t('Albarans.Eliminar albara'), icon: 'pi pi-trash', command: onEliminar },
    ]);

    const onLiniaContextMenu = (ev) => {
      selectedLinia.value = ev.data;
      liniaContextMenu.value.show(ev.originalEvent);
    };

    const liniaMenuModel = computed(() => [
      { label: () => t('Albarans.Eliminar linia'), icon: 'pi pi-trash', command: () => onEliminarLinia(selectedLinia.value) },
      {
        // Rectificació manual del pendent de facturar de la línia (requereix permís específic).
        // En un traspàs abonable no té sentit: les línies no es facturen i el pendent es queda a zero.
        label: () => t('Albarans.Canviar pendent facturar'),
        icon: 'pi pi-pencil',
        visible: () => permisosStore.tePermis('ALBARANS', 'CANVIAR_PENDENT_FACTURAR')
          && !albara.value?.isTraspasAbonable,
        command: () => { liniaPendentFacturar.value = selectedLinia.value; },
      },
    ]);

    const onEliminarLinia = async (linia) => {
      if (!linia?.id) return;
      const res = await Swal.fire({
        icon: 'warning', title: t('Albarans.Eliminar linia'),
        text: t('Albarans.Confirmar eliminar linia'),
        showCancelButton: true, reverseButtons: true, confirmButtonText: t('Albarans.Eliminar linia'), cancelButtonText: t('App.Cancela'),
        confirmButtonColor: '#d33',
      });
      if (!res.isConfirmed) return;
      // Si és l'última línia, el backend també elimina la capçalera: tanquem el modal
      const eraDarrera = linies.value.length <= 1;
      await carrega(AlbaraService.eliminarLiniaAlbara(linia.id));
      emit('canviat', props.idAlbara);
      if (eraDarrera) emit('update:visible', false);
      else await carregarDetall();
    };

    const onNumAdjuntsCanviat = (n) => {
      refrescar();
      emit('update:numAdjunts', n);
    };

    // --- Alta manual d'una línia ---

    // S'obre el buscador d'articles-client en la darrera vista que va fer servir l'usuari (per client o per article)
    const obrirAjudaArticleClient = () => {
      const desat = localStorage.getItem('AlbaransUltimaAjudaVisibleClient');
      ultimaAjudaVisibleByClient.value = desat === null ? true : JSON.parse(desat);
      if (ultimaAjudaVisibleByClient.value) visibleAjudaArticleClientByClient.value = true;
      else visibleAjudaArticleClientByArticle.value = true;
    };

    const switchAjuda = () => {
      ultimaAjudaVisibleByClient.value = !ultimaAjudaVisibleByClient.value;
      visibleAjudaArticleClientByClient.value = ultimaAjudaVisibleByClient.value;
      visibleAjudaArticleClientByArticle.value = !ultimaAjudaVisibleByClient.value;
      localStorage.setItem('AlbaransUltimaAjudaVisibleClient', ultimaAjudaVisibleByClient.value);
    };

    // Un cop escollida la peça es demana la quantitat i el preu (i s'hi fa el check abans d'afegir-la)
    const onArticleClientSeleccionat = (articleClient) => {
      visibleAjudaArticleClientByClient.value = false;
      visibleAjudaArticleClientByArticle.value = false;
      articleClientLiniaNova.value = articleClient;
    };

    return {
      detall, albara, linies, mag, totals, teDescompte, hintImport, clientNom, selectedLinia, liniaContextMenu, albaraImprimir,
      teObservacions, liniaMenuModel, onLiniaContextMenu, onEliminarLinia,
      onHide, onImprimir, onTancar, onReobrir, onEliminar,
      opcionsMenu, opcionsMenuModel, onCanviarAutofacturable, onCanviarTraspasAbonable,
      visibleCanviarAdresa, adresaEdicio, refrescar,
      editarAdresaPrincipal, editarAdresaBroker, editarAdresaProforma, props,
      visibleModalAdjunts, permisosStore, onNumAdjuntsCanviat, liniaPendentFacturar,
      modalIntern, potAfegirLinia, articleClientLiniaNova,
      visibleAjudaArticleClientByClient, visibleAjudaArticleClientByArticle,
      obrirAjudaArticleClient, switchAjuda, onArticleClientSeleccionat,
    };
  },
};
</script>

<style scoped>
  .detall-header { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; }
  .detall-header-titol { font-size: larger; font-weight: 600; }
  .detall-header-tags { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .tag-amb-accio { display: inline-flex; align-items: center; gap: 4px; }
  .tag-blocat { color: #8a8f96; font-size: 0.8rem; }

  .detall-cos { display: flex; flex-direction: column; gap: 14px; }
  .detall-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }

  .box { margin-top: 8px; border: 1px solid #c3ccd6; border-radius: 8px; overflow: hidden; background: #fbfcfd; }
  .box-titol { font-weight: 600; padding: 8px 12px; background: #eef1f5; border-bottom: 1px solid #c3ccd6; }
  .box-titol-flex { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  /* El botó d'afegir línia va enganxat al títol, no empès a l'altra punta de la capçalera */
  .box-titol-linies { display: flex; align-items: center; gap: 14px; }
  .box-titol-flex .btn-edit { height: 1.6rem; width: 1.6rem; padding: 0; }
  .box-cos { padding: 10px 12px; }
  .sense-adresa { color: #99a; font-style: italic; font-size: 0.9rem; }

  .camps { display: flex; flex-wrap: wrap; gap: 6px 24px; padding: 10px 12px; }
  .camp { display: flex; flex-direction: column; min-width: 110px; font-size: 0.9rem; }
  .camp-ample { flex-basis: 100%; }
  .camp-label { font-weight: 600; color: #556; font-size: 0.78rem; text-transform: uppercase; }

  .estat-flags { display: flex; flex-wrap: wrap; gap: 6px 16px; }
  .estat-flag { color: #99a; font-size: 0.9rem; }
  .estat-flag.actiu { color: #2c7a3d; font-weight: 600; }

  .detall-footer { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 12px; }
  .detall-footer-esquerra { display: flex; gap: 8px; flex-wrap: wrap; }

  :deep(.estilRow) { cursor: pointer; }
  :deep(.estilRow .ocultable) {
    height: 1.5rem !important;
    width: 1.5rem !important;
    margin-left: auto;
    margin-right: auto;
    display: none;
  }
  :deep(.estilRow:hover .ocultable),
  :deep(.p-highlight .ocultable) { display: flex; }
  :deep(.p-datatable.p-datatable-sm-petita .p-datatable-tbody > tr > td) { padding: 0 0.2rem; }
  :deep(.p-datatable.p-datatable-sm-petita .p-datatable-thead > tr > th) { padding: 0 0.2rem; }
  .ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
  .cel-num { width: 100%; text-align: right; }
  /* Les línies amb descompte es destaquen perquè el seu import no és el preu per la quantitat */
  .import-amb-dte { font-weight: 700; }
  .sense-linies { padding: 12px; text-align: center; color: #99a; font-style: italic; }

  .totals {
    display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 6px 28px;
    padding: 8px 12px; background: #eef1f5; border-top: 1px solid #c3ccd6;
  }
  .total { display: flex; flex-direction: column; align-items: flex-end; font-size: 0.9rem; }
  .total-label { font-weight: 600; color: #556; font-size: 0.78rem; text-transform: uppercase; }
  .total-valor { font-variant-numeric: tabular-nums; }
  .total-destacat .total-valor { font-weight: 600; font-size: 1rem; }
  .cel-divisa { width: 100%; text-align: left; }
</style>
