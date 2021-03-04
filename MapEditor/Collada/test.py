from collada import *
import os


model = Collada("../../Test/TestGuardian/Guardian_A_Perfect.dae")



boundGeometry = model.scene.objects('controller')


for controller1 in model.scene.objects('controller'):
    print(controller1.skin.id)
    controller1 = controller.Controller()
    controller1.save()

#model.controllers = boundGeometry

for controllerTest in model.controllers:
    controllerTest.controller = controller.Controller()
    controllerTest.save()

#model.controllers.save()

os.mkdir("../../Test/TestGuardian2/")
model.write("../../Test/TestGuardian2/Guardian_A_Perfect.dae")
