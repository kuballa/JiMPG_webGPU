// Declare a module for files with a '.wgsl' extension, typically used for WGSL shaders
declare module '*.wgsl' {

  // Declare that the imported shader file will be of type 'string'
  const shader: 'string';

  // Export the shader as the default export from the module
  export default shader;
}
