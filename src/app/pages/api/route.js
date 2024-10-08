import { NextResponse } from 'next/server';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { image, image_url } = req.body;

    const apiKey = '8pkFkb4Hh9JoBJzxQE8X';  // Recuerda moverlo a variables de entorno en producción
    const model = 'resnet-50dragonfruit-disease-2'; // Modelo Roboflow
    const version = '2'; // Versión del modelo

    const endpoint = `https://detect.roboflow.com/${model}/${version}?api_key=${apiKey}`;

    const response = await axios.post(endpoint, image_url ? { image_url } : { image }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    return res.status(500).json({ message: 'Error procesando la imagen' });
  }
}
