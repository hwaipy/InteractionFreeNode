import ntplib
import time
import win32api
import random

class NTPSyncer:
  def __init__(self, server):
    self.server = server
    self.offset = 0
    self.hasError = False
  
  def getTimeOffset(self):
    return ntplib.NTPClient().request(self.server, version=3).offset

  def calibrate(self):
    offset = self.getTimeOffset()
    correctTime = time.time() + offset
    tm_year, tm_mon, tm_mday, tm_hour, tm_min, tm_sec, tm_wday, tm_yday, tm_isdst = time.gmtime(correctTime)
    win32api.SetSystemTime(tm_year, tm_mon, tm_wday, tm_mday, tm_hour, tm_min, tm_sec, int((correctTime - int(correctTime)) * 1000))
    # offset = self.getTimeOffset()
    return offset

  def lock(self, checkMin, checkMax):
    while True:
      try:
        self.offset = self.calibrate()
        self.hasError = False
        # print('lock once: ', self.offset)
      except BaseException as e:
        self.hasError = True
        # print('Error')
        # print(e)
      time.sleep(random.Random().randint(checkMin, checkMax))

  def getOffset(self):
    return self.offset

  def isHavingError(self):
    return self.hasError

if __name__ == '__main__':
  s = NTPSyncer('172.16.60.200')
  print(s.lock(6, 12))

# import ctypes, sys
#
# def is_admin():
#     try:
#         # 获取当前用户的是否为管理员
#         return ctypes.windll.shell32.IsUserAnAdmin()
#     except:
#         return False
#
#
# if is_admin():
#     print('is a')
#     win32api.SetSystemTime(2020, 11, 1, 11, 13, 10, 10, 0)
# else:
#     # 重新运行这个程序使用管理员权限
#     print('is not a')
#     ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, __file__, None, 1)
#
# # tm_year, tm_mon, tm_mday, tm_hour, tm_min, tm_sec, tm_wday, tm_yday, tm_isdst = time.gmtime(getTime())
# # win32api.SetSystemTime(2000, 5, 7, 8, 12, 23, 34, 567)
