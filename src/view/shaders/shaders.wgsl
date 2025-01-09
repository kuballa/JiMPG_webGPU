struct TransformData {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>
};
@binding(0) @group(0) var<uniform> tarnsformUBO: TransformData;
@binding(1) @group(0) var myTexture: texture_2d<f32>;
@binding(2) @group(0) var mySampler: sampler;


struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) TexCoord : vec2<f32>
};

@vertex
fn vs_main(@location(0) vertexPosition: vec3<f32>, @location(1) vertexTexCoord: vec2<f32>) -> Fragment {

    var output : Fragment;
    output.Position = tarnsformUBO.projection * tarnsformUBO.view * tarnsformUBO.model * vec4<f32>(vertexPosition, 1.0);
    output.TexCoord = vertexTexCoord;

    return output;
}

@fragment
fn fs_main(@location(0) TexCoord : vec2<f32>) -> @location(0) vec4<f32> {
    return textureSample(myTexture, mySampler, TexCoord);
}