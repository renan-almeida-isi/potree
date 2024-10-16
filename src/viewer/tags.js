
export class Tags {

	constructor(viewer) {
		this.viewer = viewer;

		this.dom = $("#annotation_tree");
	}

	init() {
		this.initTagsTree();
	}

	initTagsTree() {

		let elScene = $("#menu_tags");
		let elTags = elScene.next().find("#tags");

		let tree = $(`<div id="jstree_tags"></div>`);
		elTags.append(tree);


		tree.jstree({
      plugins: ["checkbox"],
      core: {
        check_callback: true,
				expand_selected_onload: false,
				dblclick_toggle: false,
      },
      checkbox: {
        keep_selected_style: true,
        whole_node: false,
        tie_selection: false,
      },
    });

		let createNode = (parent, text, icon, object) => {
			let nodeID = tree.jstree('create_node', parent, {
				"text": text,
				"icon": icon,
				"data": object
			},
				"last", false, false);
			
			return nodeID;
		}

		let annotationsID = tree.jstree('create_node', "#", { "text": "<b>Tags</b>", "id": "tags", "state": {"opened":true} }, "last", false, false);

		// tree.on('create_node.jstree', (e, data) => {
    //     const node = data.node;
		// 		console.log(node);
    //     if (node.parent == "tags") {
    //       tree.jstree("open_all");
    //     }
		// });

		tree.on("check_node.jstree", (e, data) => {
			const node = data.node;
      if (node.id == "tags") {
        for (let key in node.children) {
          const group = node.children[key];
          const child = tree.jstree('get_node', group);
					child.data.canBeDisplayed = true;
        }
      } else {
        const annotation = data.node.data;
        annotation.canBeDisplayed = true;
      } 
    });

		tree.on("uncheck_node.jstree", (e, data) => {
			const node = data.node;
      if (node.id == "tags") {
        for (let key in node.children) {
          const group = node.children[key];
          const child = tree.jstree("get_node", group);
          child.data.canBeDisplayed = false;
        }
      } else {
        const annotation = data.node.data;
        annotation.canBeDisplayed = false;
      } 
    });

		tree.on("select_node.jstree", (e, data) => {
			this.viewer.inputHandler.deselectAll();
			$(this.viewer.renderer.domElement).focus();
		});

		tree.on('dblclick', '.jstree-anchor', (e) => {
			let instance = $.jstree.reference(e.target);
			let node = instance.get_node(e.target);
			let tag = node.data;
			tag.moveHere(this.viewer.scene.getActiveCamera());
		});

		let onAnnotationAdded = (e) => {
			let annotation = e.annotation;

			let annotationIcon = `${Potree.resourcePath}/icons/annotation.svg`;
			let parentID = this.annotationMapping.get(annotation.parent);
			let annotationID = createNode(parentID, annotation.title, annotationIcon, annotation);
			this.annotationMapping.set(annotation, annotationID);

			annotation.addEventListener("annotation_changed", (e) => {
				let annotationsRoot = $("#jstree_tags")
          .jstree()
          .get_json("annotations");
				let jsonNode = annotationsRoot.children.find(child => child.data.uuid === annotation.uuid);
				
				$.jstree.reference(jsonNode.id).rename_node(jsonNode.id, annotation.title);
			});
		};

		this.viewer.scene.annotations.addEventListener("annotation_added", onAnnotationAdded);

		let annotationIcon = `${Potree.resourcePath}/icons/annotation.svg`;
		this.annotationMapping = new Map();
		this.annotationMapping.set(this.viewer.scene.annotations, annotationsID);
		this.viewer.scene.annotations.traverseDescendants(annotation => {
			let parentID = this.annotationMapping.get(annotation.parent);
			let annotationID = createNode(parentID, annotation.title, annotationIcon, annotation);
			this.annotationMapping.set(annotation, annotationID);
		});


	}
}
