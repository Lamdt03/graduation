package controller

import "testing"

func TestFullTextSearch(t *testing.T) {
	search := SearchController{}
	loc, err := search.SearchFullText("C:\\Users\\lamdt\\GolandProjects\\graduation\\test_data\\Data_2025\\Documents\\Word_Docs\\DOCX_Files", "hello")
	if err != nil {
		t.Error(err)
	}
	t.Log(loc)
}
