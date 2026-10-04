# Story Forge

- 한국어 UI의 PC 설치형 2D 탑다운 RPG 제작 도구다.
- 사용자 지시 없이 시스템을 과도하게 세분화하거나 기능을 늘리지 않는다.
- 사용자 프로젝트와 에셋은 `.storyforge` 파일에 저장되며 Git 소스에 포함하지 않는다.
- 소스 수정 후 `npm test`를 실행한다. 업데이트 관련 변경은 저장 취소, 파일 손상, 버전 비교를 확인한다.
- 릴리스 버전은 package.json 한 곳을 기준으로 하며, package-lock.json을 함께 갱신한다.
- `npm run dist`는 Windows 설치 프로그램을 만든다. GitHub 배포는 `.github/workflows/release.yml`을 사용한다.
- `app/update-config.json`은 GitHub Actions에서 실제 repository로 설정한다. 실제 저장소가 확정되기 전 임의 URL을 게시된 링크라고 안내하지 않는다.
- 설치 프로그램에 사용자 토큰, 개인 키, 비밀 환경 변수를 포함하지 않는다.
- Windows에서 실제 수행하지 않은 설치·업데이트 시험을 완료했다고 보고하지 않는다.
