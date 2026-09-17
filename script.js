async function runGpuCalculator(num1, num2) {
  if (!navigator.gpu) {
    alert("이 브라우저는 WebGPU를 지원하지 않습니다!");
    return;
  }

  // 1. GPU 장치 연결
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  // 2. WGSL 파일 로드 및 쉐이더 모듈 생성
  const response = await fetch('./calculator.wgsl');
  const shaderCode = await response.text();
  const shaderModule = device.createShaderModule({ code: shaderCode });

  // 3. GPU로 보낼 입력 데이터 (3.5 + 4.5 연산)
  const inputData = new Float32Array([num1, num2]);

  // 입력용 GPU 버퍼 생성
  const inputBuffer = device.createBuffer({
    size: inputData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(inputBuffer, 0, inputData);

  // 출력 결과 전달용 GPU 버퍼 생성
  const resultBuffer = device.createBuffer({
    size: 4, // Float32 크기 (4바이트)
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  // 읽기 전용 스테이징 버퍼 (GPU -> CPU/JS)
  const readBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  // 4. 파이프라인 및 바인드 그룹 설정 (자바스크립트와 WGSL 연결)
  const pipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: shaderModule, entryPoint: 'main' }
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: inputBuffer } },
      { binding: 1, resource: { buffer: resultBuffer } }
    ]
  });

  // 5. GPU 명령어를 인코딩하여 WGSL 함수 실행!
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(1); // WGSL 실행
  passEncoder.end();

  // 계산 결과를 readBuffer로 복사
  commandEncoder.copyBufferToBuffer(resultBuffer, 0, readBuffer, 0, 4);
  device.queue.submit([commandEncoder.finish()]);

  // 6. WGSL 계산 결과 읽어오기
  await readBuffer.mapAsync(GPUMapMode.READ);
  const resultArray = new Float32Array(readBuffer.getMappedRange());
  
  console.log(`[WGSL 계산 결과] ${num1} + ${num2} = ${resultArray[0]}`);
  return resultArray[0];
}

// 테스트 실행 (12.5 더하기 7.5)
runGpuCalculator(12.5, 7.5);
