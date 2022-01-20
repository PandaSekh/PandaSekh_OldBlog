export function stringToDate(publishedDate: string){
	const dateParts = publishedDate.split("-"); // 0 = day, 1 = month, 2 = year
	const monthNumber = Number.parseInt(dateParts[1]) - 1;
	return `${dateParts[0]} ${monthArray[monthNumber]} ${dateParts[2]}`;
}

// very approximate function
export function getTimeToRead(content: string): string {
	const words = content.match(/\b(\w+)\b/g)!.length;
	if (!words || words < 180){
		return "Less than 1 minute read";
	} else if (words < 360) {
		return "1 minute read";
	} else {
		return `${Math.round(words / 180)} minute read`;
	}
}

const monthArray = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"June",
	"Jul",
	"Aug",
	"Sept",
	"Oct",
	"Nov",
	"Dec"
]