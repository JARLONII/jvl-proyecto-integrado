<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'], //Añadir sacntum

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:4200', 'http://192.168.0.15:4200'], //Ruta de angular

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, //true para que funcione el login con laravel sanctum

];
