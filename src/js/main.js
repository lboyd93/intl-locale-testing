require([
	"esri/Map",
	"esri/views/MapView",
	"esri/layers/FeatureLayer",
	"esri/intl",
], (Map, MapView, FeatureLayer, intl) => {
	const radioButtonGroup = document.getElementById("radio-group");
	const label = document.getElementById("percent-format-label");
	const panel = document.getElementById("panel");
	label.innerHTML =
		"Percent Format: " +
		new Intl.NumberFormat("en", {
			style: "percent",
			maximumSignificantDigits: 4,
		}).format(0.1267);
	radioButtonGroup.addEventListener(
		"calciteRadioButtonGroupChange",
		(event) => {
			const selectedValue = radioButtonGroup.selectedItem.value;
			intl.setLocale(selectedValue);
			panel.description = "Current locale: " + selectedValue;
			console.log(selectedValue);
			label.innerHTML =
				"Percent Format: " +
				new Intl.NumberFormat(selectedValue, {
					style: "percent",
					maximumSignificantDigits: 4,
				}).format(0.1254);
		}
	);
	// setup the map
	const map = new Map({
		basemap: "hybrid",
	});
	const view = new MapView({
		container: "mapDiv",
		map: map,
		center: [-118.399400711028, 34.08713590709093],
		zoom: 17,
		popup: {
			dockEnabled: true,
			dockOptions: {
				buttonEnabled: false,
				breakpoint: false,
			},
		},
	});
	const featureLayer = new FeatureLayer({
		url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Beverly%20Hills%20Trees%20By%20Block/FeatureServer/0",
		popupTemplate: {
			// autocasts as new PopupTemplate()
			title: "Beverly Hills trees by block",
			// Set content elements in the order to display.
			// The first element displayed here is the fieldInfos.
			content: [
				{
					// It is also possible to set the fieldInfos outside of the content
					// directly in the popupTemplate. If no fieldInfos is specifically set
					// in the content, it defaults to whatever may be set within the popupTemplate.
					type: "fields", // FieldsContentElement
					fieldInfos: [
						{
							fieldName: "Point_Count",
							visible: false,
							label: "Count of Points",
							format: {
								places: 0,
								digitSeparator: true,
							},
						},
						{
							fieldName: "relationships/0/Point_Count_COMMON",
							visible: true,
							label: "Sum of species tree count",
							format: {
								places: 0,
								digitSeparator: true,
							},
							statisticType: "sum",
						},
						{
							fieldName: "relationships/0/COMMON",
							visible: false,
							label: "Common Name",
						},
						{
							fieldName: "BLOCKCE10",
							visible: true,
							label: "Block",
						},
					],
				},
				{
					// A relationship element can be added to show a list of
					// records that are related to the current selected feature.
					// This element displays a list of tree types that reside in
					// the current selected census block.
					type: "relationship", // RelationshipContent
					relationshipId: 0,
					title: "Trees in {BLOCKCE10} Census Block",
					description:
						"Types of trees that reside in census block {BLOCKCE10}.",
					displayCount: 2,
				},
				{
					// You can also set a descriptive text element. This element
					// uses an attribute from the featurelayer which displays a
					// sentence giving the total amount of trees value within a
					// specified census block. Text elements can only be set within the content.
					type: "text", // TextContentElement
					text: "There are {Point_Count} trees within census block {BLOCKCE10}.",
				},
				{
					// You can set a media element within the popup as well. This
					// can be either an image or a chart. You specify this within
					// the mediaInfos. The following creates a pie chart in addition
					// to two separate images. The chart is also set up to work with
					// related tables. Similar to text elements, media can only be set within the content.
					type: "media", // MediaContentElement
					mediaInfos: [
						{
							title: "<b>Count by type</b>",
							type: "pie-chart",
							caption: "",
							value: {
								fields: ["relationships/0/Point_Count_COMMON"],
								normalizeField: null,
								tooltipField: "relationships/0/COMMON",
							},
						},
						{
							title: "<b>Mexican Fan Palm</b>",
							type: "image",
							caption: "tree species",
							value: {
								sourceURL:
									"https://www.sunset.com/wp-content/uploads/96006df453533f4c982212b8cc7882f5-800x0-c-default.jpg",
							},
						},
					],
				},
				{
					// You can set a attachment element(s) within the popup as well.
					// Similar to text and media elements, attachments can only be set
					// within the content. Any attachmentInfos associated with the feature
					// will be listed in the popup.
					type: "attachments", // AttachmentsContentElement
				},
			],
		},
		outFields: ["*"],
	});
	map.add(featureLayer);
	// The related non-spatial table needs to be added to the map for
	// the RelationshipContent within the PopupTemplate to display.
	const table = new FeatureLayer({
		url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Beverly%20Hills%20Trees%20By%20Block/FeatureServer/1",
		popupTemplate: {
			title: "{COMMON}",
			outFields: ["*"],
			fieldInfos: [
				{
					fieldName: "MAX_HEIGHT",
					label: "Max height",
				},
				{
					fieldName: "MIN_HEIGHT",
					label: "Min height",
				},
				{
					fieldName: "MEAN_HEIGHT",
					label: "Average height",
				},
				{
					fieldName: "Point_Count_COMMON",
					label: "Number of trees",
				},
			],
			content: [
				{
					type: "fields",
				},
			],
		},
	});
	// Load the table and add it to the map's table collection.
	table.load().then(() => {
		map.tables.add(table);
	});
});
