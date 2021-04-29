import { GLTF } from "three/examples/jsm/loaders/GLTFLoader"
import GLTFAnimation from './GLTFAnimation'
import Scene from "../core/Scene"
import EventBus from "../../utils/EventBus"
import { GLEvents } from "../../utils/Events"
import { AnimationMixer, LoopOnce, Vector3 } from "three"

class PlanetScenery {
    name: string
    model: GLTF
    yPosition: number
    animation: GLTFAnimation|null

    constructor (
        name: string,
        model: GLTF,
        yPosition: number,
        animation: GLTFAnimation|null
    ) { 
        this.name = name
        this.model = model
        this.yPosition = yPosition
        this.animation = animation

        this.model.scene.visible = false
        this.model.scene.position.y = this.yPosition
        this.model.scene.scale.set(0.005, 0.005, 0.005)

        if (this.animation) {
            this.model.scene.traverse((child: any) => {
                if (child.name === this.animation!.animationTool.name) {
                    this.animation!.animationTool.model = child
                }
                if (child.name === this.animation!.animationTarget.name) {
                    this.animation!.animationTarget.model = child
                }
            })
        }
    }

    setupScenery (scene: Scene) {
        if (this.animation && this.animation.animationTool.model && this.animation.animationTarget.model) {
            EventBus.emit(GLEvents.HIGHLIGHT_MANAGER_REQUIRED, true)

            scene.animationMixer = new AnimationMixer(this.model.scene)

            this.animation.action = scene.animationMixer.clipAction(this.animation.clip)
            this.animation.action.setLoop(LoopOnce, 1)

            // NOTE : We indicate that scissors are an interactive & draggable object$
            if (scene.draggableObjects.length) {
                scene.draggableObjects.shift()
            }
            scene.draggableObjects.push(this.animation.animationTool.model) // Draggable
            scene.dragControls.transformGroup = true

            const initialScale = new Vector3(
                this.animation.animationTool.model.scale.x + 0.002,
                this.animation.animationTool.model.scale.y + 0.002,
                this.animation.animationTool.model.scale.z + 0.002)

            EventBus.on<number>(GLEvents.UPDATE_TOOL_SCALE, (elapsedTime) => {
                if (elapsedTime !== undefined) {
                    this.animation!.updateToolScaleAnimation(elapsedTime, initialScale)
                }
            })

            scene.dragControls.activate()

            // TODO: custom cursor
            scene.dragControls.addEventListener('hoveron', (e) => {
                setTimeout(() => {
                    scene.renderer.domElement.style.cursor = 'grab'
                }, 1)
            })

            scene.dragControls.addEventListener('hoveroff', (e) => {
                scene.renderer.domElement.style.cursor = 'default'
            })

            scene.dragControls.addEventListener('dragstart', (e) => {
                console.log('dragstart', );
                setTimeout(() => {
                    scene.renderer.domElement.style.cursor = 'grabbing'
                }, 1)
                this.animation!.onDragStart(scene)
            })

            scene.dragControls.addEventListener('dragend', (e) => {
                this.animation!.onDragEnd(scene)
            })

            scene.highlightManager.add(this.animation.animationTool.model)
            scene.interactionManager.add(this.animation.animationTarget.model)
            scene.interactionManager.add(this.animation.animationTool.model)
        } else {
            console.error("Tool or Target undefined")
        }
    }
}

export default PlanetScenery
