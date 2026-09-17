// 1. WGSL 내부의 계산 전용 함수 (원하시는 함수!)
fn add_func(a: f32, b: f32) -> f32 {
    return a + b;
}

// 2. 자바스크립트와 데이터를 주고받을 메모리 버퍼 설정
@group(0) @binding(0) var<storage, read> inputNumbers : array<f32>;
@group(0) @binding(1) var<storage, read_write> resultNumber : array<f32>;

// 3. 자바스크립트가 호출할 진입점(Entry Point)
@compute @workgroup_size(1)
fn main() {
    // 자바스크립트에서 넘어온 inputNumbers[0]과 [1]을 wgsl 함수에 넣어서 계산!
    resultNumber[0] = add_func(inputNumbers[0], inputNumbers[1]);
}
