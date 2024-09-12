'use client';
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { poppins } from './fonts';

function Page() {
  const [image, setImage] = useState(null); // Para almacenar la imagen cargada
  const [url, setUrl] = useState(''); // Para almacenar la URL de la imagen
  const [fileMethod, setFileMethod] = useState('upload'); // Alternar entre archivo o URL
  const [results, setResults] = useState(null); // Almacenar los resultados de la API
  const [loading, setLoading] = useState(false); // Para controlar el estado de carga
  const [error, setError] = useState(''); // Manejo de errores

  const apiKey = 'oflvb52Gq8eTSlvcOw3A';  // Recuerda moverlo a variables de entorno en producción
  const model = 'resnet-50dragonfruit-disease-1h8yt'; // Modelo Roboflow
  const version = '1'; // Versión del modelo

  // Maneja el cambio de archivo y lo convierte a base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Guardar la imagen en formato base64
      };
      reader.readAsDataURL(file); // Leer la imagen como URL en base64
    } else {
      setError('Por favor, selecciona un archivo de imagen válido');
    }
  };

  // Maneja el cambio en la URL de la imagen
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  // Alterna entre el método de subir archivo o URL
  const handleMethodChange = (method) => {
    setFileMethod(method);
    setResults(null);
    setError('');
  };

  // Enviar la imagen (archivo o URL) a la API de Roboflow
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let apiUrl = `https://detect.roboflow.com/${model}/${version}?api_key=${apiKey}`;

    try {
      // Si el método es cargar un archivo
      if (fileMethod === 'upload' && image) {
        const resizedImage = await resizeImage(image); // Redimensionar imagen antes de enviarla
        apiUrl += `&image=${encodeURIComponent(resizedImage)}`; // Añadir la imagen redimensionada como parámetro
      } 
      // Si el método es ingresar una URL
      else if (fileMethod === 'url' && url) {
        apiUrl += `&image=${encodeURIComponent(url)}`; // Añadir la URL como parámetro
      } else {
        setError('Por favor, selecciona una imagen o ingresa una URL válida');
        return;
      }

      // Realizar la solicitud a la API con axios
      const response = await axios.get(apiUrl);
      setResults(response.data); // Guardar los resultados de la API
    } catch (error) {
      setError('Error procesando la imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-start">
      <div className="flex flex-row items-center justify-between px-3 py-0 bg-blue-200 mb-10 md:px-6 md:py-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10">
            <Image
              src="/pitaya.jpg"
              layout="intrinsic"
              width={100}
              height={100}
              objectFit="contain"
              alt="Captura de pantalla del proyecto de panel de control mostrando versión de escritorio"
            />
          </div>
          <strong className={`${poppins.className} text-xl lg:text-3xl mb-4`}>AgroScan</strong>
        </div>
      </div>
      <div className="flex space-x-10 ml-4">
      <button
          className={`${poppins.className} ${fileMethod === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} 
            px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out 
            hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 
            focus:ring-blue-300 active:bg-blue-700`}
          onClick={() => handleMethodChange('upload')}
        >
          Subir Archivo
        </button>

        <button
          className={`${poppins.className} ${fileMethod === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} 
            px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out 
            hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 
            focus:ring-blue-300 active:bg-blue-700`}
          onClick={() => handleMethodChange('url')}
        >
          Usar URL
        </button>

      </div>
  
            <form onSubmit={handleSubmit} className="mt-4 ml-4">
        {fileMethod === 'upload' ? (
          <div className="mb-12">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500"
            />
          </div>
        ) : (
          <div className="mb-12">
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Ingresa la URL de la imagen"
              className="block w-auto text-sm text-gray-700 bg-gray-200"
              style={{ width: "300px" }}
            />
          </div>
        )}  
        <button
        type="submit"
        disabled={loading}
        className={`${poppins.className} mt-4 px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out 
          ${loading ? 'bg-gray-400' : 'bg-blue-500'} 
          text-white hover:bg-blue-600 hover:shadow-lg focus:outline-none 
          focus:ring-2 focus:ring-blue-300 active:bg-blue-700`}
      >
        {loading ? 'Cargando...' : 'Enviar Imagen'}
      </button>

      </form>
  
      {loading && <p className={`${poppins.className} ml-4`}>Procesando la imagen...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {results && (
        <div>
          <h2 className={`${poppins.className} text-xl font-semibold mt-4 ml-4 ml-4`}>Resultados de Detección</h2>
  
          {/* Nueva lógica para mostrar si la planta está sana o no */}
          <div className="text-xl font-semibold mt-4 ml-4" style={{ width: '200px', height: 'auto' }}>
          {results.predictions.healthy.confidence >= 0.5 ? (
                  <Image
                    src="/sano.png"
                    layout="responsive"
                    width={500}
                    height={154}
                    objectFit="contain"
                    alt="Captura de pantalla del proyecto de panel de control mostrando versión de escritorio"
                  />
          ) : (
            <Image
              src="/enfermo.png"
              layout="responsive"
              width={4501}
              height={1385}
              objectFit="contain"
              alt="Captura de pantalla del proyecto de panel de control mostrando versión de escritorio"
            />
          )}
        </div>
        </div>
      )}
    </main>
  );
  
}

export default Page;

// Función para redimensionar la imagen
const resizeImage = (base64Str) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1500;
      const MAX_HEIGHT = 1500;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 1.0)); // Convertir a base64 en formato JPEG
    };
  });
};
