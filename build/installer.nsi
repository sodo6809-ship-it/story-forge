Unicode true
!include "MUI2.nsh"
!include "x64.nsh"
!include "FileFunc.nsh"
!ifndef APP_VERSION
!define APP_VERSION "0.2.0"
!endif
Var UpgradePID
Var Relaunch
Name "이야기 공방"
Icon "icon.ico"
UninstallIcon "icon.ico"
OutFile "../release/StoryForge-Setup-${APP_VERSION}.exe"
InstallDir "$LOCALAPPDATA\Programs\StoryForge"
InstallDirRegKey HKCU "Software\StoryForge" "InstallDir"
RequestExecutionLevel user
SetCompressor zlib
ShowInstDetails show
ShowUninstDetails show
!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\Story Forge.exe"
!define MUI_FINISHPAGE_RUN_TEXT "이야기 공방 실행"
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Korean"
Function .onInit
 ${GetParameters} $0
 ${GetOptions} $0 "/UPGRADEPID=" $UpgradePID
 ${GetOptions} $0 "/RELAUNCH" $Relaunch
 ClearErrors
 ${If} $UpgradePID != ""
  System::Call 'kernel32::OpenProcess(i 0x00100000, i 0, i $UpgradePID) p.r1'
  ${If} $1 != 0
   System::Call 'kernel32::WaitForSingleObject(p r1, i 60000) i.r2'
   System::Call 'kernel32::CloseHandle(p r1)'
   ${If} $2 != 0
    MessageBox MB_ICONSTOP "이야기 공방이 종료되지 않았습니다. 작업을 저장하고 닫은 뒤 다시 시도하세요."
    Abort
   ${EndIf}
  ${EndIf}
 ${EndIf}
 ${IfNot} ${RunningX64}
  MessageBox MB_ICONSTOP "Windows 10/11 64비트가 필요합니다."
  Abort
 ${EndIf}
FunctionEnd
Section "Install"
 SetShellVarContext current
 SetOutPath "$INSTDIR"
 File /r "../release/win-unpacked/*"
 WriteUninstaller "$INSTDIR\Uninstall.exe"
 CreateDirectory "$SMPROGRAMS\이야기 공방"
 CreateShortcut "$SMPROGRAMS\이야기 공방\이야기 공방.lnk" "$INSTDIR\Story Forge.exe"
 CreateShortcut "$DESKTOP\이야기 공방.lnk" "$INSTDIR\Story Forge.exe"
 WriteRegStr HKCU "Software\StoryForge" "InstallDir" "$INSTDIR"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\StoryForge" "DisplayName" "이야기 공방"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\StoryForge" "UninstallString" '"$INSTDIR\Uninstall.exe"'
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\StoryForge" "DisplayVersion" "${APP_VERSION}"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\StoryForge" "Publisher" "Story Forge"
 WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\StoryForge" "InstallLocation" "$INSTDIR"
 WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\StoryForge" "NoModify" 1
 WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\StoryForge" "NoRepair" 1
 ${If} $UpgradePID != ""
  Exec '"$INSTDIR\Story Forge.exe"'
 ${EndIf}
SectionEnd
Section "Uninstall"
 SetShellVarContext current
 Delete "$DESKTOP\이야기 공방.lnk"
 Delete "$SMPROGRAMS\이야기 공방\이야기 공방.lnk"
 RMDir "$SMPROGRAMS\이야기 공방"
 ; Only program files are removed. User projects and recovery data remain.
 RMDir /r "$INSTDIR\locales"
 RMDir /r "$INSTDIR\resources"
 Delete "$INSTDIR\*.pak"
 Delete "$INSTDIR\*.dll"
 Delete "$INSTDIR\*.bin"
 Delete "$INSTDIR\*.dat"
 Delete "$INSTDIR\*.json"
 Delete "$INSTDIR\*.txt"
 Delete "$INSTDIR\*.html"
 Delete "$INSTDIR\Story Forge.exe"
 Delete "$INSTDIR\Uninstall.exe"
 Delete "$INSTDIR\LICENSE"
 RMDir "$INSTDIR"
 DeleteRegKey HKCU "Software\StoryForge"
 DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\StoryForge"
SectionEnd
