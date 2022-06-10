const titleTab = document.getElementById('titleTab');
const tabs = document.querySelectorAll('button.nav-link');

// Variables correspondientes al formulario Vehículo
const formVehicle =  document.getElementById('form-vehicle');
const btnResetFormVehicle =  document.getElementById('btn-reset-form-vehicle');
const modalMessage =  document.getElementById('modal-message');
const modalVehicleError = new bootstrap.Modal(document.getElementById('modal-vehicle-error'));
const dictionaryV = {
    marca: {
        cat: 'Marca',
        keyId: 'iIdMarca',
        keyStr: 'sMarca',
        hierarchyy: 1
    },
    submarca: {
        cat: 'Submarca',
        keyId: 'iIdSubMarca',
        keyStr: 'sSubMarca',
        hierarchyy: 2
    },
    modelo: {
        cat: 'Modelo',
        keyId: 'iIdModelo',
        keyStr: 'sModelo',
        hierarchyy: 3
    },
    descripcion:{
        cat: 'DescripcionModelo',
        keyId: 'iIdDescripcionModelo',
        keyStr: 'sDescripcion',
        hierarchyy: 4
    }
}

// Variables correspondientes al formulario Domicilio
const formHome =  document.getElementById('form-home');
const btnResetFormHome =  document.getElementById('btn-reset-form-home');


const selectTab = event => {
    const title = event.target.getAttribute('data-title');
    titleTab.innerHTML = title;
}

const openModal = message => {
    modalMessage.innerHTML = message;
    modalVehicleError.show();
}

// Funciones correspondientes al formulario Vehículo
const fetchVehicle = (target, filtro = 1) => {
    formVehicle[target].disabled = false;
    const raw = JSON.stringify({
        "NombreCatalogo": dictionaryV[target].cat,
        "Filtro": filtro,
        "IdAplication": 2
    });

    fetch("https://apitestcotizamatico.azurewebsites.net/api/catalogos",{
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: raw
    })
    .then(response => response.json())
    .then(result => {
        if(result.Error == null){
            const dataVehicle = JSON.parse(result.CatalogoJsonString);
            formVehicle[target].innerHTML = '<option disabled value="" selected>Seleccione una opción</option>';
            dataVehicle.forEach(item => formVehicle[target].innerHTML += `<option value="${item[dictionaryV[target].keyId]}">${item[dictionaryV[target].keyStr]}</option>`)

            Object.entries(dictionaryV).forEach(([key, value]) => {
                if(value.hierarchyy > dictionaryV[target].hierarchyy){
                    document.getElementById(key).disabled = true;
                    document.getElementById(key).innerHTML = '<option disabled selected>Seleccione una opción</option>';
                }
            })
        }else{
            Object.entries(dictionaryV).forEach(([key, value]) => {
                if(value.hierarchyy >= dictionaryV[target].hierarchyy){
                    document.getElementById(key).disabled = true;
                    document.getElementById(key).innerHTML = '<option disabled selected>Seleccione una opción</option>';
                }
            })
            openModal('Lo sentimos, no tenemos cobertura para la opción seleccionada, favor de revisar la información');
        }
    })
    .catch(error => console.log('error', error));
}

const sendFormVehicle = event => {
    event.preventDefault();
    openModal('El vehículo ha sido seleccionado correctamente');
}

const resetFormVehicle = () => {
    formVehicle.querySelectorAll('select').forEach(item => {
        if(item != formVehicle['marca']){
            item.disabled = true;
            item.innerHTML = '<option disabled selected>Seleccione una opción</option>';
        }else{
            item.value = '';
        }
    })
}

// Funciones correspondientes al formulario Domicilio
const sendFormHome = event => {
    event.preventDefault();
    const raw = JSON.stringify({
        "NombreCatalogo": "Sepomex",
        "Filtro": formHome['cp'].value,
        "IdAplication": 2
    });

    fetch("https://apitestcotizamatico.azurewebsites.net/api/catalogos",{
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: raw
    })
    .then(response => response.json())
    .then(result => {
        if(result.Error == null){
            const location = JSON.parse(result.CatalogoJsonString)[0];
            document.getElementById('state').value = location.Municipio.Estado.sEstado;
            document.getElementById('municipality').value = location.Municipio.sMunicipio;
            document.getElementById('suburb').value = location.Ubicacion[0].sUbicacion;
        }else{
            openModal('Lo sentimos, la información proporcionada no corresponde con ninguna ubicación, favor de verificarlo');
        }
    })
    .catch(error => console.log('error', error));
}

const resetFormHome = () => {
    formHome.querySelectorAll('input').forEach(item => item.value = '');
}

window.addEventListener('DOMContentLoaded', () => {
    tabs.forEach(item => item.addEventListener('click', (e) => selectTab(e)));
    
    fetchVehicle('marca');
    formVehicle['marca'].addEventListener('change', (e) => fetchVehicle('submarca', e.target.value));
    formVehicle['submarca'].addEventListener('change', (e) => fetchVehicle('modelo', e.target.value));
    formVehicle['modelo'].addEventListener('change', (e) => fetchVehicle('descripcion', e.target.value));
    btnResetFormVehicle.addEventListener('click', resetFormVehicle);
    formVehicle.addEventListener('submit', (e) => sendFormVehicle(e));

    btnResetFormHome.addEventListener('click', resetFormHome);
    formHome.addEventListener('submit', (e) => sendFormHome(e));
});